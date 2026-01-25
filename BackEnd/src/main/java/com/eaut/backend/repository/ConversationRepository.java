package com.eaut.backend.repository;

import com.eaut.backend.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findBySessionId(String sessionId);

    // Tìm các hội thoại có tin nhắn mới sau khoảng thời gian nhất định (Dùng cho
    // AnalysisService)
    List<Conversation> findByLastMessageAtAfter(OffsetDateTime time);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Conversation c LEFT JOIN FETCH c.messages ORDER BY c.lastMessageAt DESC")
    List<Conversation> findAllWithMessages();
}
