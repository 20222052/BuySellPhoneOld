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


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_item_models",
        joinColumns = @JoinColumn(name = "product_item_id"),
        inverseJoinColumns = @JoinColumn(name = "model_id")
    )
    @Builder.Default
    private Set<ProductModel> models = new HashSet<>();


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_item_colors",
        joinColumns = @JoinColumn(name = "product_item_id"),
        inverseJoinColumns = @JoinColumn(name = "color_id")
    )
    @Builder.Default
    private Set<ProductColor> colors = new HashSet<>();


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