package com.eaut.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardOrderItemResponse {
    private String productName;
    private int quantity;
    private BigDecimal price;
}
