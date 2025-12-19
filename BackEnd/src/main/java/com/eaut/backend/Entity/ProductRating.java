package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_ratings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductRating {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;


    @Column(nullable = false)
    private Integer rating; // 1..5


    @Column
    private String content;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
