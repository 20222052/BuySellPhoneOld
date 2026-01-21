package com.eaut.backend.controller;

import com.eaut.backend.entities.ChatMessage;
import com.eaut.backend.entities.Conversation;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.service.AI_ChatBot.ChatQueueService;
import com.eaut.backend.service.AI_ChatBot.RagServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        return ResponseEntity.ok(sessionId);
    }

    // API Lấy lịch sử đoạn chat theo SessionID
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String sessionId) {
        return conversationRepository.findBySessionId(sessionId)
                .map(Conversation::getMessages)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(Collections.emptyList()));
    }
}
