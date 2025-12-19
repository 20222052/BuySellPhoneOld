package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.constant.MediaType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "product_media")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductMedia{
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;


    @Column(nullable = false)
    private String url;


    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private MediaType type = MediaType.image;


    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary; // Ảnh đại diện


    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
