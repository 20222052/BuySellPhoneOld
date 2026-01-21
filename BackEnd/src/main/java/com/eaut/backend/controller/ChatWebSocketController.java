package com.eaut.backend.controller;

import com.eaut.backend.service.AI_ChatBot.AIChatService;
import com.eaut.backend.service.AI_ChatBot.ChatQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@CrossOrigin(origins = "*")
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AIChatService aiChatService;
    private final ChatQueueService chatQueueService;

    /**
     * Nhận tin nhắn chat từ user gửi lên
     * Client send to: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void processMessage(@Payload Map<String, String> payload) {
        String sessionId = payload.get("sessionId");
        String message = payload.get("content");

        // 1. Kiểm tra nếu user muốn gặp nhân viên
        if ("Gặp nhân viên".equalsIgnoreCase(message) || "human".equalsIgnoreCase(message)) {
            int pos = chatQueueService.joinQueue(sessionId);

            // Gửi phản hồi về cho user này
            messagingTemplate.convertAndSend("/queue/chat/" + sessionId,
                    "Yêu cầu được chấp nhận. Bạn đang ở vị trí thứ " + pos + " trong hàng đợi.");

            // Thông báo cập nhật Dashboard cho Admin (nếu có topic admin)
            messagingTemplate.convertAndSend("/topic/admin/queue", chatQueueService.getAllQueue());
            return;
        }

        // 2. Nếu đang chat bình thường (hoặc chat với Bot)
        // Gọi AI Service xử lý
        String aiResponse = aiChatService.processUserMessage(message, sessionId);

        // 3. Gửi câu trả lời về lại cho Client (Private Queue của Session đó)
        messagingTemplate.convertAndSend("/queue/chat/" + sessionId, aiResponse);
    }
}
