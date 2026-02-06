package com.eaut.backend.model.request;

import com.eaut.backend.constant.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;
}
