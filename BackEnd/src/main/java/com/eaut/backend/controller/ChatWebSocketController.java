package com.eaut.backend.controller;

import com.eaut.backend.constant.ConversationStatus;
import com.eaut.backend.constant.SenderType;
import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.repository.ChatMessageRepository;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.service.AI_ChatBot.AIChatService;
import com.eaut.backend.service.AI_ChatBot.ChatQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.OffsetDateTime;
import java.util.Map;

@CrossOrigin(origins = "*")
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AIChatService aiChatService;
    private final ChatQueueService chatQueueService;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * Nhận tin nhắn chat từ user gửi lên
     * Client send to: /app/chat.send
     */
    @Transactional
    @MessageMapping("/chat.send")
    public void processMessage(@Payload Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        String message = payload.get("content");

        // Lấy hoặc tạo Conversation để đảm bảo lịch sử luôn được lưu
        Conversation conversation = getOrCreateConversation(sessionId);

        // 1. Kiểm tra nếu user muốn gặp nhân viên
        if ("Gặp nhân viên".equalsIgnoreCase(message) || "human".equalsIgnoreCase(message)) {
            // Lưu tin nhắn USER yêu cầu gặp nhân viên
            saveMessage(conversation, message, SenderType.USER, false);

            int pos = chatQueueService.joinQueue(sessionId);

            // Cập nhật trạng thái conversation sang PENDING_HUMAN
            conversation.setStatus(ConversationStatus.PENDING_HUMAN);
            conversationRepository.save(conversation);

            String systemMsg = "Yêu cầu được chấp nhận. Bạn đang ở vị trí thứ " + pos + " trong hàng đợi.";

            // Lưu thông báo hệ thống vào lịch sử
            saveMessage(conversation, systemMsg, SenderType.SYSTEM, true);

            // Gửi phản hồi về cho user này
            messagingTemplate.convertAndSend("/queue/chat/" + sessionId, systemMsg);

            // Thông báo cập nhật Dashboard cho Admin (nếu có topic admin)
            messagingTemplate.convertAndSend("/topic/admin/queue", chatQueueService.getAllQueue());
            return;
        }

        // 2. Kiểm tra nếu session đang chat với admin (HUMAN_ACTIVE)
        if (chatQueueService.isHumanSession(sessionId)) {
            // Lưu tin nhắn của USER trong giai đoạn human
            saveMessage(conversation, message, SenderType.USER, false);

            // Forward tin nhắn tới admin
            messagingTemplate.convertAndSend("/topic/admin/session/" + sessionId,
                    "USER: " + message);
            return;
        }

        // 2.5. Kiểm tra nếu user đang trong hàng đợi chờ nhân viên (PENDING_HUMAN)
        if (chatQueueService.getPosition(sessionId) > 0) {
            // Lưu tin nhắn USER (họ vẫn nhắn trong lúc chờ)
            saveMessage(conversation, message, SenderType.USER, false);

            String waitMsg = "Bạn đang nằm trong hàng đợi hỗ trợ. Vui lòng chờ nhân viên kết nối.";
            saveMessage(conversation, waitMsg, SenderType.SYSTEM, true);
            messagingTemplate.convertAndSend("/queue/chat/" + sessionId, waitMsg);
            return;
        }

        // 3. Mặc định: Bot xử lý tin nhắn (AIChatService tự lưu USER + BOT message)
        String aiResponse = aiChatService.processUserMessage(message, sessionId);
        messagingTemplate.convertAndSend("/queue/chat/" + sessionId, aiResponse);
    }

    /**
     * Admin gửi tin nhắn đến user
     * Client send to: /app/chat.admin.send
     */
    @Transactional
    @MessageMapping("/chat.admin.send")
    public void adminSendMessage(@Payload Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        String message = payload.get("content");

        // Lấy hoặc tạo Conversation
        Conversation conversation = getOrCreateConversation(sessionId);

        // Đảm bảo trạng thái là HUMAN_ACTIVE khi admin đang reply
        if (conversation.getStatus() != ConversationStatus.HUMAN_ACTIVE) {
            conversation.setStatus(ConversationStatus.HUMAN_ACTIVE);
            conversationRepository.save(conversation);
        }

        // Lưu tin nhắn AGENT vào lịch sử
        String displayMessage = "👨‍💼 ADMIN: " + message;
        saveMessage(conversation, message, SenderType.AGENT, true);

        // Gửi tin nhắn admin tới user
        messagingTemplate.convertAndSend("/queue/chat/" + sessionId, displayMessage);
    }

    // ──────────── Helper methods ────────────

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

    private void saveMessage(Conversation conversation, String content, SenderType senderType, boolean isRead) {
        ChatMessage msg = ChatMessage.builder()
                .conversation(conversation)
                .content(content)
                .senderType(senderType)
                .isRead(isRead)
                .build();
        chatMessageRepository.save(msg);

        conversation.setLastMessageAt(OffsetDateTime.now());
        conversationRepository.save(conversation);
    }
}
