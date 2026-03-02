package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO để trả về thông tin diagnostic đã lưu
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDiagnosticDTO {
    private UUID id;
    private UUID productItemId;

    // Manual Functional Checks
    private Boolean microphoneDamage;
    private Boolean frontCameraDamage;
    private Boolean rearCameraDamage;
    private BigDecimal batteryHealth;
    private Boolean chargingPortDamage;
    private Boolean speakerDamage;
    private Boolean buttonDamage;
    private Boolean wifiBluetoothIssue;

    // Screen conditions
    private BigDecimal screenCracks;
    private BigDecimal scratches;
    private BigDecimal edgeDings;
    private BigDecimal dents;
    private BigDecimal displayFailure;
    private BigDecimal deadPixels;
    private BigDecimal displayLines;

    // Overall
    private BigDecimal totalDepreciation;
    private String overallAssessment;

    // Status and metadata
    private String status;
    private String additionalNotes;
    private LocalDate testDate;
    private String repairRecommendations;
    private BigDecimal estimatedRepairCost;

    // Staff info
    private UUID staffId;
    private String staffName;

    // Analysis details (from AI)
    private String aiAnalysisDetails;

    // Price prediction fields
    private BigDecimal minPredictedPrice;
    private BigDecimal maxPredictedPrice;
    private Boolean isContactStore;
    private java.util.List<String> images;
}
