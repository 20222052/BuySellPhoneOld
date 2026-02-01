package com.eaut.backend.dto.dashboard;

import com.eaut.backend.entities.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatisticsResponse {
    private long newCustomersToday;
    private long newOrdersToday;
    private long soldProductsToday;
    private BigDecimal revenueToday;
    private List<DashboardOrderResponse> recentOrders;
}
