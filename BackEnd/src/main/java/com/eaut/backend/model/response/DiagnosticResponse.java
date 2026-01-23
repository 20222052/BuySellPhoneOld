package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO từ AI diagnostic service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticResponse {
    private boolean success;
    private String timestamp;
    private DiagnosticData diagnostic;
    private String error;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiagnosticData {
        // Screen conditions
        private BigDecimal screenCracks;
        private BigDecimal scratches;
        private BigDecimal edgeDings;
        private BigDecimal dents;
        private BigDecimal displayFailure;
        private BigDecimal deadPixels;
        private BigDecimal displayLines;

        // Overall assessment
        private BigDecimal totalDepreciation;
        private String overallAssessment;

        // Additional details
        private AnalysisDetails analysisDetails;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalysisDetails {
        private String screenAnalysis;
        private String scratchAnalysis;
        private String edgeAnalysis;
        private String dentAnalysis;
        private String displayAnalysis;
        private String pixelAnalysis;
        private String linesAnalysis;
        private String generalDescription;
    }
}
