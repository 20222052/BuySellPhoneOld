package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.constant.TradeinStatus;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tradeins")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Tradein extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", nullable = false)
    private ProductItem productItem;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_diagnostic_id")
    private ProductDiagnostic productDiagnostic;


    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TradeinStatus status = TradeinStatus.pending;


    @Column(name = "quoted_price", precision = 12, scale = 2)
    private BigDecimal quotedPrice; // Giá được báo cho khách hàng


    @Column(name = "appointment_at")
    private OffsetDateTime appointmentAt; // Thời gian hẹn khách hàng


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff; // Nhân viên xử lý


    @Column(name = "inspection_notes")
    private String inspectionNotes; // Ghi chú kiểm tra
}
