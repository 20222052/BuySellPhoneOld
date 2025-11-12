package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.constant.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand; // thương hiệu sản phẩm


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category; // danh mục sản phẩm


    @Column(length = 200, nullable = false)
    private String name; // tên sản phẩm


    @Column
    private String description; // mô tả sản phẩm


    @Column(name = "warranty_months", nullable = false)
    private Integer warrantyMonths = 0; // thời gian bảo hành tính theo tháng


    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ProductStatus status = ProductStatus.active; // trạng thái sản phẩm


    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductItem> productItems = new ArrayList<>();


    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductMedia> media = new ArrayList<>();
}