package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import com.eaut.backend.entities.baseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItem extends AuditBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductModel> models = new ArrayList<>();

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductMedia> productMedia = new ArrayList<>();

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice; // Giá gốc

    @Column(name = "sell_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellPrice; // Giá bán

    @Column(name = "compare_price", precision = 12, scale = 2)
    private BigDecimal comparePrice; // Giá so sánh

    @Column(name = "qty_available", nullable = false)
    @Builder.Default
    private Integer qtyAvailable = 1; // Số lượng có sẵn

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductDiagnostic> diagnostics = new ArrayList<>();
}