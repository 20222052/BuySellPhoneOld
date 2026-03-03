package com.eaut.backend.entities;

import com.eaut.backend.entities.baseEntity.AuditBase;
import com.eaut.backend.constant.ConversationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation extends AuditBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Khách hàng (có thể null nếu là khách vãng lai/anonymous)

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId; // ID phiên làm việc (dùng cho khách vãng lai lưu trong Redis/Cookie)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status = ConversationStatus.BOT_ACTIVE;
    // Enum: BOT_ACTIVE (Bot đang chat), PENDING_HUMAN (Chờ nhân viên), HUMAN_ACTIVE (Nhân viên đang chat), CLOSED

    @Column(name = "last_message_at")
    private OffsetDateTime lastMessageAt;

    @Column(name = "chat_quality", columnDefinition = "VARCHAR(10) DEFAULT NULL")
    private String chatQuality; // Enum: GOOD, BAD (đánh giá chất lượng chat)


    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();
}
