package com.eaut.backend.service.AI_ChatBot;

import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.repository.ChatMessageRepository;
import com.eaut.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    // Các từ khóa quan trọng thể hiện nhu cầu mua hàng
    // Có thể lưu trong DB hoặc Config
    private static final List<String> BUYING_KEYWORDS = List.of(
            "mua", "giá", "bao nhiêu", "tư vấn", "cần tìm", "có hàng không",
            "trả góp", "khuyến mãi", "đặt hàng", "shop", "cửa hàng");

    /**
     * Chạy định kỳ để quét các hội thoại mới cập nhật trong 15 phút qua
     * Cron: Chạy mỗi 5 phút
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void analyzeRecentConversations() {
        OffsetDateTime timeWindow = OffsetDateTime.now().minusMinutes(15);

        // Tìm các hội thoại có tin nhắn mới gần đây và chưa được phân tích (hoặc cần
        // phân tích lại)
        // Note: Cần thêm field 'analyzed_at' vào conversation nếu muốn tối ưu.
        // Ở đây demo quét theo lastMessageAt
        List<Conversation> activeConversations = conversationRepository.findByLastMessageAtAfter(timeWindow);

        for (Conversation conv : activeConversations) {
            analyzeConversation(conv);
        }
    }

    /**
     * Phân tích toàn bộ nội dung chat của 1 session
     */
    public void analyzeConversation(Conversation conversation) {
        List<ChatMessage> messages = conversation.getMessages();

        // Ghép toàn bộ nội dung chat của User
        String fullUserContent = messages.stream()
                .filter(m -> com.eaut.backend.constant.SenderType.USER.equals(m.getSenderType()))
                .map(m -> m.getContent().toLowerCase())
                .reduce("", (a, b) -> a + " " + b);

        boolean isImportant = false;
        StringBuilder tags = new StringBuilder();

        // Check keywords
        for (String keyword : BUYING_KEYWORDS) {
            if (fullUserContent.contains(keyword)) {
                isImportant = true;
                tags.append(keyword).append(",");
            }
        }

        // Logic nâng cao: Có thể dùng Chính AI để tóm tắt nhu cầu nếu content dài
        // if (fullUserContent.length() > 200) { callAISummarize(...) }

        // Cập nhật trạng thái quan trọng vào Conversation (cần thêm field vào entity
        // nếu chưa có)
        // Hiện tại ta có thể log ra hoặc lưu vào bảng riêng Report
        if (isImportant) {
            System.out.println("Phát hiện khách hàng tiềm năng: Session " + conversation.getSessionId());
            System.out.println("Tags: " + tags);
            // TODO: conversation.setIsImportant(true);
            // conversation.setTags(tags.toString());
            // conversationRepository.save(conversation);
        }
    }
}
