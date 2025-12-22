package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentMethod;
import com.eaut.backend.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "orders")
@NoArgsConstructor @AllArgsConstructor @Builder
public class Order extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    } // tạo UUID tự động nếu chưa có


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người đặt hàng


    @Column(length = 50, nullable = false, unique = true)
    private String code; // Mã đơn hàng


    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private OrderStatus status = OrderStatus.pending; // Trạng thái đơn hàng


    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20, nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.cod; // Phương thức thanh toán


    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.unpaid; // Trạng thái thanh toán mặc định là chưa thanh toán


    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal; // Tổng tiền hàng


    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO; // Phí vận chuyển


    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total; // Tổng thanh toán


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress; // Địa chỉ giao hàng

    private String snapshotShippingFullName;
    private String snapshotShippingPhone;
    private String snapshotAddress;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
