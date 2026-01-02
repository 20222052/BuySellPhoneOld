package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_colors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductColor {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id", nullable = false)
    private ProductModel productModel;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(name = "hex_code", length = 7, unique = true)
    private String hexCode;

    @OneToOne(mappedBy = "productColor", cascade = CascadeType.ALL, orphanRemoval = true)
    private ProductMedia media;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo
}