package com.eaut.backend.controller;

import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.service.AI_ChatBot.ChatQueueService;
import com.eaut.backend.service.AI_ChatBot.RagServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatQueueService chatQueueService;
    private final RagServiceImpl ragService;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // API Test Ingest thủ công
    @PostMapping("/ingest/{productItemId}")
    public ResponseEntity<String> ingestProduct(@PathVariable UUID productItemId) {
        ragService.ingestProduct(productItemId);
        return ResponseEntity.ok("Ingest thành công productId: " + productItemId);
    }

    // API lấy danh sách hàng đợi
    @GetMapping("/queue")
    public ResponseEntity<List<String>> getQueue() {
        return ResponseEntity.ok(chatQueueService.getAllQueue());
    }

    // API Admin pick user từ queue
    @PostMapping("/queue/pick")
    public ResponseEntity<String> pickUser() {
        String sessionId = chatQueueService.popNextCustomer();
        if (sessionId == null) {
            return ResponseEntity.ok("Hàng đợi rỗng.");
        }

        // Mark session as human mode
        chatQueueService.markAsHumanSession(sessionId);

        return ResponseEntity.ok(sessionId);
    }

    // API Admin kết thúc hỗ trợ, trả user về bot
    @PostMapping("/queue/end/{sessionId}")
    public ResponseEntity<String> endConversation(@PathVariable String sessionId) {
        chatQueueService.endHumanSession(sessionId);

        // Thông báo cho customer
        messagingTemplate.convertAndSend("/queue/chat/" + sessionId,
                "Nhân viên đã kết thúc hỗ trợ. Bạn có thể tiếp tục chat với bot hoặc yêu cầu gặp nhân viên lại.");

        return ResponseEntity.ok("Đã kết thúc hỗ trợ cho session: " + sessionId);
    }

    // API Lấy lịch sử đoạn chat theo SessionID
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String sessionId) {
        return conversationRepository.findBySessionId(sessionId)
                .map(Conversation::getMessages)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Collections.emptyList()));
    }

    // API Lấy danh sách tất cả các cuộc hội thoại (Sắp xếp theo thời gian tin nhắn
    // cuối)
    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getAllConversations() {
        return ResponseEntity.ok(conversationRepository.findByLastMessageAtAfter(java.time.OffsetDateTime.MIN)); // Lấy
                                                                                                                 // tất
                                                                                                                 // cả
        // Hoặc sắp xếp lại bên Service nếu cần. Tạm thời dùng findByLastMessageAtAfter
        // với thời gian rất cũ để lấy hết.
        // Tuy nhiên tốt nhất là dùng findAll với Sort.
    }

    @GetMapping("/history/all")
    public ResponseEntity<List<Conversation>> getAllHistory() {
        return ResponseEntity.ok(conversationRepository.findAllWithMessages());
    }
}
