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

    // Dashboard Report Queries
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Conversation c WHERE c.createdAt BETWEEN :start AND :end")
    long countConversationsByDateRange(@org.springframework.data.repository.query.Param("start") OffsetDateTime start, @org.springframework.data.repository.query.Param("end") OffsetDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT new map(FUNCTION('DATE', c.createdAt) as date, COUNT(c) as conversations) " +
           "FROM Conversation c " +
           "WHERE c.createdAt BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', c.createdAt) ORDER BY FUNCTION('DATE', c.createdAt)")
    List<java.util.Map<String, Object>> getDailyConversationStats(@org.springframework.data.repository.query.Param("start") OffsetDateTime start, @org.springframework.data.repository.query.Param("end") OffsetDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Conversation c WHERE c.createdAt BETWEEN :start AND :end ORDER BY c.createdAt DESC")
    List<Conversation> findRecentConversationsByDateRange(@org.springframework.data.repository.query.Param("start") OffsetDateTime start, @org.springframework.data.repository.query.Param("end") OffsetDateTime end, org.springframework.data.domain.Pageable pageable);
}
