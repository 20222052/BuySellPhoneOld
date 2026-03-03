package com.eaut.backend.model.response.report;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReportResponseDTO {
    
    private ProductSummaryDTO summary;
    private List<TopSellingProductDTO> topSelling;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<ChartDataDTO> chartData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummaryDTO {
        private long totalProducts;
        private long activeProducts;
        private long outOfStock;
        private long discontinued;
        private long totalSold;
    }
}
