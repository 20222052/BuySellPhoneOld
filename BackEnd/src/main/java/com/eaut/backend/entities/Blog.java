package com.eaut.backend.entities;

import com.eaut.backend.entities.baseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;

// import java.time.LocalDateTime; // Removed unused import
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "blogs")
public class Blog extends AuditBase {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (viewCount == null) {
            viewCount = 0L;
        }
    }

}
