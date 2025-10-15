package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "product_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductItem extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private ProductModel model;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "color_id", nullable = false)
    private ProductColor color;


    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;


    @Column(name = "sell_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellPrice;


    @Column(name = "compare_price", precision = 12, scale = 2)
    private BigDecimal comparePrice;


    @Column(name = "qty_available", nullable = false)
    private Integer qtyAvailable = 1;


    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductDiagnostic> diagnostics = new ArrayList<>();
}