package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", nullable = false)
    private ProductItem productItem;

    private String snapshotProductName;
    private String snapshotProductModel;
    private String snapshotProductColor;
    private String snapshotProductMediaUrl;


    @Column(nullable = false)
    private Integer qty;


    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice; // Giá mỗi đơn vị


    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice; // Giá tổng cộng


    @Column(name = "warranty_until")
    private LocalDate warrantyUntil;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo
}