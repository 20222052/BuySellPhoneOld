package com.eaut.backend.entities;

import com.eaut.backend.constant.SenderType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() { if (id == null) id = UUID.randomUUID(); }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SenderType senderType; // Enum: USER, BOT, AGENT

    @Column(name = "is_read")
    private boolean isRead = false;

    // Lưu độ tin cậy của AI (nếu sender là BOT). Dùng để đánh giá hiệu quả.
    @Column(name = "ai_confidence_score")
    private Double aiConfidenceScore;

    @CreationTimestamp
    private OffsetDateTime createdAt;
}