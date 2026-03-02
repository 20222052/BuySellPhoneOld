package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import com.eaut.backend.entities.baseEntity.AuditBase;
import com.eaut.backend.constant.DiagnosticStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "product_diagnostics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDiagnostic extends AuditBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    } // tạo UUID tự động nếu chưa có

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", nullable = false)
    private ProductItem productItem; // Sản phẩm được kiểm tra

    // Audio & camera
    @Column(name = "microphone_damage")
    private Boolean microphoneDamage; // Tình trạng micro
    @Column(name = "front_camera_damage")
    private Boolean frontCameraDamage; // Tình trạng camera trước
    @Column(name = "rear_camera_damage")
    private Boolean rearCameraDamage; // Tình trạng camera sau

    // Battery & hardware
    @Column(name = "battery_health", precision = 5, scale = 2)
    private BigDecimal batteryHealth; // Tình trạng pin (%)
    @Column(name = "charging_port_damage")
    private Boolean chargingPortDamage; // Tình trạng cổng sạc
    @Column(name = "speaker_damage")
    private Boolean speakerDamage; // Tình trạng loa
    @Column(name = "button_damage")
    private Boolean buttonDamage; // Tình trạng nút bấm
    @Column(name = "wifi_bluetooth_issue")
    private Boolean wifiBluetoothIssue; // Tình trạng wifi/bluetooth

    // Screen
    @Column(name = "screen_cracks", nullable = false, precision = 5, scale = 2)
    private BigDecimal screenCracks = BigDecimal.ZERO; // Tình trạng màn hình
    @Column(name = "scratches", nullable = false, precision = 5, scale = 2)
    private BigDecimal scratches = BigDecimal.ZERO; // Tình trạng trầy xước
    @Column(name = "edge_dings", nullable = false, precision = 5, scale = 2)
    private BigDecimal edgeDings = BigDecimal.ZERO; // Tình trạng móp méo cạnh
    @Column(name = "dents", nullable = false, precision = 5, scale = 2)
    private BigDecimal dents = BigDecimal.ZERO; // Tình trạng lõm
    @Column(name = "display_failure", nullable = false, precision = 5, scale = 2)
    private BigDecimal displayFailure = BigDecimal.ZERO; // Tình trạng lỗi hiển thị
    @Column(name = "dead_pixels", nullable = false, precision = 5, scale = 2)
    private BigDecimal deadPixels = BigDecimal.ZERO; // Tình trạng điểm chết
    @Column(name = "display_lines", nullable = false, precision = 5, scale = 2)
    private BigDecimal displayLines = BigDecimal.ZERO; // Tình trạng đường sọc

    // Overall
    @Column(name = "total_depreciation", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalDepreciation = BigDecimal.ZERO; // Tỷ lệ hao mòn tổng thể
    @Column(name = "overall_assessment")
    private String overallAssessment; // Đánh giá tổng thể

    @Column(name = "min_predicted_price", precision = 12, scale = 2)
    private BigDecimal minPredictedPrice;
    @Column(name = "max_predicted_price", precision = 12, scale = 2)
    private BigDecimal maxPredictedPrice;
    @Column(name = "is_contact_store")
    private Boolean isContactStore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_diagnostic_images", joinColumns = @JoinColumn(name = "diagnostic_id"))
    @Column(name = "image_url")
    private java.util.List<String> images;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DiagnosticStatus status = DiagnosticStatus.pending; // Trạng thái kiểm tra

    @Column(name = "additional_notes")
    private String additionalNotes; // Ghi chú bổ sung
    @Column(name = "test_date")
    private LocalDate testDate = LocalDate.now(); // Ngày kiểm tra
    @Column(name = "repair_recommendations")
    private String repairRecommendations; // Khuyến nghị sửa chữa
    @Column(name = "estimated_repair_cost", precision = 12, scale = 2)
    private BigDecimal estimatedRepairCost; // Chi phí sửa chữa ước tính

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff; // Nhân viên thực hiện kiểm tra
}
