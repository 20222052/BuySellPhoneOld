package com.eaut.backend.service.AI_ChatBot;

import com.eaut.backend.constant.ConversationStatus;
import com.eaut.backend.constant.SenderType;
import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.model.response.ChatBotResponse;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductMediaResponse;
import com.eaut.backend.repository.ChatMessageRepository;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.service.ProductItemService;
import com.eaut.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatService {

    private final RagService ragService;
    private final ChatQueueService chatQueueService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProductItemService productItemService;

    /** Số lượng tin nhắn lịch sử gửi kèm cho AI */
    private static final int HISTORY_SIZE = 1;

    @Value("${spring.ai.deepseek.url}")
    private String deepSeekUrl;

    @Value("${spring.ai.deepseek.api-key}")
    private String deepSeekApiKey;

    @Value("${spring.ai.rag.threshold}")
    private double threshold;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Xử lý tin nhắn từ User, trả về {@link ChatBotResponse} chứa text + product
     * cards.
     */
    @Transactional
    public ChatBotResponse processUserMessage(String userMessage, String sessionId) {
        // 0. Tạo hoặc lấy Conversation
        Conversation conversation = getOrCreateConversation(sessionId);

        // Lưu tin nhắn User
        saveMessage(conversation, userMessage, SenderType.USER);

        // 1. Kiểm tra hàng đợi
        if (chatQueueService.getPosition(sessionId) > 0) {
            return ChatBotResponse.builder()
                    .text("Bạn đang nằm trong hàng đợi hỗ trợ. Vui lòng chờ nhân viên kết nối.")
                    .build();
        }

        // 2. Lấy lịch sử chat gần nhất (HISTORY_SIZE*2 cặp user/bot)
        List<ChatMessage> recentHistory = getRecentHistory(conversation, HISTORY_SIZE * 2);

        // 3. RAG Search
        List<Map<String, Object>> relatedDocs = ragService.searchProducts(userMessage);

        String botText;
        List<ChatBotResponse.ProductSuggestion> productSuggestions = new ArrayList<>();

        if (relatedDocs.isEmpty()) {
            botText = callDeepSeekAI(userMessage, "", recentHistory);
        } else {
            // Build RAG context từ text
            String context = relatedDocs.stream()
                    .map(doc -> (String) doc.get("content"))
                    .collect(Collectors.joining("\n---\n"));

            botText = callDeepSeekAI(userMessage, context, recentHistory);

            // Build product suggestions từ RAG results
            productSuggestions = buildProductSuggestions(relatedDocs);
        }

        // Lưu phản hồi Bot
        saveMessage(conversation, botText, SenderType.BOT);

        return ChatBotResponse.builder()
                .text(botText)
                .products(productSuggestions)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Lấy thông tin sản phẩm từ RAG results để build product suggestion cards.
     */
    private List<ChatBotResponse.ProductSuggestion> buildProductSuggestions(
            List<Map<String, Object>> relatedDocs) {

        List<ChatBotResponse.ProductSuggestion> suggestions = new ArrayList<>();

        for (Map<String, Object> doc : relatedDocs) {
            try {
                UUID productItemId = UUID.fromString((String) doc.get("productItemId"));
                ProductItemDetailResponse detail = productItemService.findByIdWithDetails(productItemId);

                // Lấy ảnh primary đầu tiên (sort theo isPrimary rồi sortOrder)
                String imageUrl = detail.getMedia() == null ? null
                        : detail.getMedia().stream()
                                .filter(ProductMediaResponse::isPrimary)
                                .min(Comparator.comparingInt(m -> m.getSortOrder() == null ? 99 : m.getSortOrder()))
                                .or(() -> detail.getMedia().stream().findFirst())
                                .map(ProductMediaResponse::getUrl)
                                .orElse(null);

                suggestions.add(ChatBotResponse.ProductSuggestion.builder()
                        .id(productItemId.toString())
                        .name(detail.getName())
                        .productName(detail.getProductName())
                        .brandName(detail.getBrandName())
                        .sellPrice(detail.getSellPrice())
                        .comparePrice(detail.getComparePrice())
                        .imageUrl(imageUrl)
                        .build());
            } catch (Exception e) {
                log.warn("Không thể load product detail cho RAG result: {}", e.getMessage());
            }
        }
        return suggestions;
    }

    /**
     * Lấy lịch sử chat gần nhất (chỉ USER + BOT), thứ tự cũ → mới.
     * Bỏ qua tin nhắn USER vừa được lưu (mới nhất).
     */
    private List<ChatMessage> getRecentHistory(Conversation conversation, int limit) {
        List<ChatMessage> raw = chatMessageRepository.findRecentMessages(
                conversation.getId(),
                PageRequest.of(0, limit + 1));
        if (raw.size() > 1) {
            raw = raw.subList(1, raw.size()); // bỏ tin mới nhất (= USER vừa lưu)
        } else {
            return Collections.emptyList();
        }
        Collections.reverse(raw); // đảo lại: cũ → mới
        return raw;
    }

    private Conversation getOrCreateConversation(String sessionId) {
        return conversationRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .sessionId(sessionId)
                            .status(ConversationStatus.BOT_ACTIVE)
                            .lastMessageAt(OffsetDateTime.now())
                            .build();
                    return conversationRepository.save(newConv);
                });
    }

    private void saveMessage(Conversation conversation, String content, SenderType sender) {
        ChatMessage msg = ChatMessage.builder()
                .conversation(conversation)
                .content(content)
                .senderType(sender)
                .isRead(true)
                .build();
        chatMessageRepository.save(msg);
        conversation.setLastMessageAt(OffsetDateTime.now());
        conversationRepository.save(conversation);
    }

    /**
     * Gọi DeepSeek AI với lịch sử multi-turn.
     */
    @SuppressWarnings("unchecked")
    private String callDeepSeekAI(String query, String context, List<ChatMessage> recentHistory) {
        String systemPrompt = """
                Bạn là trợ lý AI tư vấn bán hàng điện thoại cực kỳ thân thiện, thuyết phục và chuyên nghiệp.
                Mục tiêu: giúp khách chọn được máy phù hợp và tăng khả năng chốt đơn.

                QUY TẮC QUAN TRỌNG:
                - Chỉ dùng "Context sản phẩm" để nói về thông số/giá/tên máy cụ thể.
                - Nếu Context không có thông tin, tuyệt đối KHÔNG bịa. Hãy nói: "Hiện mình chưa thấy thông tin đó trong hệ thống".
                - Nếu Context có thông tin, tuyệt đối KHÔNG bịa. hãy sử dụng thông tin có trong Context.
                - Nếu khách hỏi mơ hồ hoặc thiếu dữ liệu, hãy hỏi tối đa 2–4 câu ngắn để làm rõ nhu cầu.
                - Luôn tư vấn theo hướng lợi ích: pin, camera, hiệu năng, màn hình, độ bền, bảo hành, phù hợp công việc.
                - Giọng điệu: tự nhiên, gần gũi, không máy móc, không dài dòng.
                - Cuối mỗi câu trả lời nên có CTA mềm.
                - Vì hệ thống sẽ hiển thị thẻ sản phẩm riêng, KHÔNG cần liệt kê chi tiết thông số/giá từng máy trong text.
                  Thay vào đó hãy nêu điểm khác biệt nổi bật và hỏi thêm nhu cầu để dẫn dắt khách.

                CÁCH TRẢ LỜI (ưu tiên):
                1) Tóm tắt nhu cầu khách (1 câu).
                2) Nêu điểm nổi bật của từng máy (1–2 câu/máy, không liệt kê thông số dài).
                3) Kết thúc bằng CTA.
                
                Nhấn mạnh: chỉ trả lời dựa trên thông tin có trong Context, KHÔNG BỊA. Nếu không có thông tin, hãy thành thật nói bạn không biết.

                Context sản phẩm (nếu có):
                %s
                """
                .formatted(context);

        // Xây dựng messages multi-turn
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for (ChatMessage hist : recentHistory) {
            String role = hist.getSenderType() == SenderType.USER ? "user" : "assistant";
            messages.add(Map.of("role", role, "content", hist.getContent()));
        }
        messages.add(Map.of("role", "user", "content", query));

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages,
                "max_tokens", 500,
                "stream", false);

        try {
            Map<String, Object> response = restClient.post()
                    .uri(deepSeekUrl)
                    .header("Authorization", "Bearer " + deepSeekApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối với bộ não AI.";

        } catch (Exception e) {
            log.error("DeepSeek API error: {}", e.getMessage());
            return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
        }
    }
}
