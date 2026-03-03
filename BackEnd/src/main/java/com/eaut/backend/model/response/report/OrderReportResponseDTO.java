package com.eaut.backend.model.response.report;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderReportResponseDTO {
    private OrderSummaryDTO summary;
    private List<ChartDataDTO> chartData;
    private List<StatusBreakdownDTO> statusBreakdown;
    private List<RecentOrderDTO> recentOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummaryDTO {
        private long totalOrders;
        private long completedOrders;
        private long pendingOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
    }
}
