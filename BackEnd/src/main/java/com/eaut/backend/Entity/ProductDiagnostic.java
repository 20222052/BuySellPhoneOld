package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.untils.DiagnosticStatus;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "product_diagnostics")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDiagnostic extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", nullable = false)
    private ProductItem productItem;


    // Audio & camera
    @Column(name = "microphone_damage") private Boolean microphoneDamage;
    @Column(name = "front_camera_damage") private Boolean frontCameraDamage;
    @Column(name = "rear_camera_damage") private Boolean rearCameraDamage;


    // Battery & hardware
    @Column(name = "battery_health", precision = 5, scale = 2) private BigDecimal batteryHealth;
    @Column(name = "charging_port_damage") private Boolean chargingPortDamage;
    @Column(name = "speaker_damage") private Boolean speakerDamage;
    @Column(name = "button_damage") private Boolean buttonDamage;
    @Column(name = "wifi_bluetooth_issue") private Boolean wifiBluetoothIssue;


    // Screen
    @Column(name = "screen_cracks", nullable = false, precision = 5, scale = 2) private BigDecimal screenCracks = BigDecimal.ZERO;
    @Column(name = "scratches", nullable = false, precision = 5, scale = 2) private BigDecimal scratches = BigDecimal.ZERO;
    @Column(name = "edge_dings", nullable = false, precision = 5, scale = 2) private BigDecimal edgeDings = BigDecimal.ZERO;
    @Column(name = "dents", nullable = false, precision = 5, scale = 2) private BigDecimal dents = BigDecimal.ZERO;
    @Column(name = "display_failure", nullable = false, precision = 5, scale = 2) private BigDecimal displayFailure = BigDecimal.ZERO;
    @Column(name = "dead_pixels", nullable = false, precision = 5, scale = 2) private BigDecimal deadPixels = BigDecimal.ZERO;
    @Column(name = "display_lines", nullable = false, precision = 5, scale = 2) private BigDecimal displayLines = BigDecimal.ZERO;


    // Overall
    @Column(name = "total_depreciation", nullable = false, precision = 5, scale = 2) private BigDecimal totalDepreciation = BigDecimal.ZERO;
    @Column(name = "overall_assessment") private String overallAssessment;


    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DiagnosticStatus status = DiagnosticStatus.pending;


    @Column(name = "additional_notes") private String additionalNotes;
    @Column(name = "test_date") private LocalDate testDate = LocalDate.now();
    @Column(name = "repair_recommendations") private String repairRecommendations;
    @Column(name = "estimated_repair_cost", precision = 12, scale = 2) private BigDecimal estimatedRepairCost;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;
}
