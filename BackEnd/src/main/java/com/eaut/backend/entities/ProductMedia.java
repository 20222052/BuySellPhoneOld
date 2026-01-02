package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import com.eaut.backend.constant.MediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMedia {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_color_id")
    private ProductColor productColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", nullable = false)
    private ProductItem productItem;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String public_id;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private MediaType type = MediaType.image;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary; // Ảnh đại diện

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo
}
