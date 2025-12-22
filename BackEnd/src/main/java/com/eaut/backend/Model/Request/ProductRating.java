package com.eaut.backend.Model.Request;

// === Lombok & JPA imports ===

import com.eaut.backend.Entity.OrderItem;
import com.eaut.backend.Entity.Product;
import com.eaut.backend.Entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@NoArgsConstructor @AllArgsConstructor @Builder
public class ProductRating {
    private UUID productId;
    private UUID userId;
    private OrderItem orderItem;


    @Column(nullable = false)
    private Integer rating; // 1..5


    @Column
    private String content;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

}
