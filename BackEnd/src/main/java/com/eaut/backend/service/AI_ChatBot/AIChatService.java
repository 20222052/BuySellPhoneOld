package com.eaut.backend.service.AI_ChatBot;

import com.eaut.backend.constant.ConversationStatus;
import com.eaut.backend.constant.SenderType;
import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.repository.ChatMessageRepository;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIChatService {

    private final RagService ragService;
    private final ChatQueueService chatQueueService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    // Số lượng tin nhắn lịch sử gần nhất gửi kèm cho AI
    private static final int HISTORY_SIZE = 3;

    // Config từ application.yaml
    @Value("${spring.ai.deepseek.url}")
    private String deepSeekUrl;

    @Value("${spring.ai.deepseek.api-key}")
    private String deepSeekApiKey;

    @Value("${spring.ai.rag.threshold}")
    private double threshold;

    @Value("${spring.ai.deepseek.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    /**
     * Xử lý tin nhắn từ User
     *
     * @param userMessage Câu hỏi của người dùng
     * @param sessionId   Phiên làm việc
     * @return Câu trả lời (hoặc gợi ý gặp nhân viên)
     */
    @Transactional
    public String processUserMessage(String userMessage, String sessionId) {
        // 0. Tạo hoặc lấy Conversation từ DB
        Conversation conversation = getOrCreateConversation(sessionId);

        // Lưu tin nhắn User
        saveMessage(conversation, userMessage, SenderType.USER);

        // 1. Kiểm tra xem user có đang trong hàng đợi không?
        if (chatQueueService.getPosition(sessionId) > 0) {
            return "Bạn đang nằm trong hàng đợi hỗ trợ. Vui lòng chờ nhân viên kết nối.";
        }

        // 2. Lấy lịch sử chat gần nhất (ngoại trừ tin nhắn vừa lưu, lấy trước đó)
        // Lấy HISTORY_SIZE*2 + 1 để bao gồm cặp user/bot rồi slice,
        // nhưng đơn giản hơn: lấy (HISTORY_SIZE*2) tin nhắn gần nhất TRƯỚC tin hiện tại
        List<ChatMessage> recentHistory = getRecentHistory(conversation, HISTORY_SIZE * 2);

        // 3. RAG Search: Tìm kiếm thông tin sản phẩm liên quan
        List<Map<String, Object>> relatedDocs = ragService.searchProducts(userMessage);

        String botResponse;

        // 4. Kiểm tra RAG context
        if (relatedDocs.isEmpty()) {
            botResponse = callDeepSeekAI(userMessage, "", recentHistory);
        } else {
            // Build Context từ RAG
            String context = relatedDocs.stream()
                    .map(doc -> (String) doc.get("content"))
                    .collect(Collectors.joining("\n---\n"));

            botResponse = callDeepSeekAI(userMessage, context, recentHistory);
        }

        // Lưu tin nhắn Bot
        saveMessage(conversation, botResponse, SenderType.BOT);

        return botResponse;
    }

    /**
     * Lấy lịch sử chat gần nhất của conversation (chỉ USER + BOT),
     * trả về theo thứ tự thời gian tăng dần (cũ → mới).
     * Không bao gồm tin nhắn USER vừa được lưu (lấy từ vị trí thứ 2 trở đi khi đếm
     * từ mới).
     */
    private List<ChatMessage> getRecentHistory(Conversation conversation, int limit) {
        // Lấy limit+1 để bỏ tin nhắn USER vừa lưu (mới nhất)
        List<ChatMessage> raw = chatMessageRepository.findRecentMessages(
                conversation.getId(),
                PageRequest.of(0, limit + 1));
        // raw[0] là tin mới nhất (= USER vừa lưu), bỏ nó đi
        if (raw.size() > 1) {
            raw = raw.subList(1, raw.size()); // bỏ phần tử đầu (mới nhất)
        } else {
            return Collections.emptyList();
        }
        // Đảo lại để có thứ tự cũ → mới
        Collections.reverse(raw);
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
     * Gọi API DeepSeek với lịch sử đoạn chat gần nhất.
     *
     * @param query         Câu hỏi hiện tại của user
     * @param context       Context sản phẩm từ RAG (có thể rỗng)
     * @param recentHistory Danh sách tin nhắn lịch sử (USER + BOT, cũ → mới)
     */
    @SuppressWarnings("unchecked")
    private String callDeepSeekAI(String query, String context, List<ChatMessage> recentHistory) {
        String systemPrompt = """
                Bạn là trợ lý AI tư vấn bán hàng điện thoại cực kỳ thân thiện, thuyết phục và chuyên nghiệp.
                Mục tiêu: giúp khách chọn được máy phù hợp và tăng khả năng chốt đơn.

                QUY TẮC QUAN TRỌNG:
                - Chỉ dùng "Context sản phẩm" để nói về thông số/giá/tên máy cụ thể.
                - Nếu Context không có thông tin, tuyệt đối KHÔNG bịa. Hãy nói: "Hiện mình chưa thấy thông tin đó trong hệ thống".
                - Nếu khách hỏi mơ hồ hoặc thiếu dữ liệu, hãy hỏi tối đa 2–4 câu ngắn để làm rõ nhu cầu.
                - Luôn tư vấn theo hướng lợi ích: pin, camera, hiệu năng, màn hình, độ bền, bảo hành, phù hợp công việc.
                - Giọng điệu: tự nhiên, gần gũi, không máy móc, không dài dòng.
                - Cuối mỗi câu trả lời nên có CTA mềm: "Bạn muốn mình gợi ý 2–3 mẫu phù hợp nhất không?" hoặc "Bạn chốt tầm giá nào để mình gửi lựa chọn tốt nhất?".

                CÁCH TRẢ LỜI (ưu tiên):
                1) Tóm tắt nhu cầu khách (1 câu).
                2) Đưa ra gợi ý rõ ràng (2–5 gạch đầu dòng) dựa trên Context nếu có.
                3) Nếu chưa đủ dữ liệu → hỏi thêm 2–4 câu.
                4) Kết thúc bằng CTA.

                Context sản phẩm (nếu có):
                %s
                """
                .formatted(context);

        // Xây dựng danh sách messages theo format multi-turn của DeepSeek/OpenAI
        List<Map<String, String>> messages = new ArrayList<>();

        // 1. System prompt
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // 2. Lịch sử các lượt chat trước (cũ → mới)
        for (ChatMessage hist : recentHistory) {
            String role = hist.getSenderType() == SenderType.USER ? "user" : "assistant";
            messages.add(Map.of("role", role, "content", hist.getContent()));
        }

        // 3. Câu hỏi hiện tại của user
        messages.add(Map.of("role", "user", "content", query));

        // Payload gửi lên DeepSeek API
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
            e.printStackTrace();
            return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau: " + e.getMessage();
        }
    }
}
