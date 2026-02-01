package com.eaut.backend.dto.dashboard;

import com.eaut.backend.constant.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DashboardOrderResponse {
    private UUID id;
    private String code;
    private BigDecimal total;
    private OrderStatus status;
    private OffsetDateTime createdAt;
    private DashboardUserResponse user;
    private List<DashboardOrderItemResponse> items;
}
