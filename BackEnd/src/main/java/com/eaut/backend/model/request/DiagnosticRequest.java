package com.eaut.backend.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO để gọi AI diagnostic service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticRequest {
    private UUID productItemId; // ID của product item cần kiểm tra

    // Base64 encoded images or URLs
    private java.util.List<String> imagePhoneOlds;

    // Manual Functional Checks
    private Boolean microphoneDamage;
    private Boolean frontCameraDamage;
    private Boolean rearCameraDamage;
    private java.math.BigDecimal batteryHealth;
    private Boolean chargingPortDamage;
    private Boolean speakerDamage;
    private Boolean buttonDamage;
    private Boolean wifiBluetoothIssue;

    // Optional: Staff ID nếu có nhân viên thực hiện
    private UUID staffId;

    // Optional: Additional notes
    private String additionalNotes;
}
