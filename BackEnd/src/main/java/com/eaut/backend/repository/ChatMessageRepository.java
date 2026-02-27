package com.eaut.backend.repository;

import com.eaut.backend.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByConversationId(UUID conversationId);

    /**
     * Lấy N tin nhắn gần nhất của một conversation (chỉ USER + BOT, không lấy
     * SYSTEM)
     * Sắp xếp DESC để lấy tin mới nhất trước, sau đó đảo lại trong code.
     */
    @org.springframework.data.jpa.repository.Query("SELECT m FROM ChatMessage m WHERE m.conversation.id = :conversationId "
            +
            "AND m.senderType IN ('USER', 'BOT') " +
            "ORDER BY m.createdAt DESC")
    List<ChatMessage> findRecentMessages(
            @org.springframework.data.repository.query.Param("conversationId") UUID conversationId,
            org.springframework.data.domain.Pageable pageable);
}
