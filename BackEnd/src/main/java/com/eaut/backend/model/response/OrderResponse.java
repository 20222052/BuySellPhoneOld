package com.eaut.backend.model.response;

import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentMethod;
import com.eaut.backend.constant.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private UUID id;
    private String code;
    private UUID userId;
    private String customerEmail;
    private String customerPhone;
    private String customerName; // From Address snapshot or User
    private OrderStatus status; // pending, shipping, etc.
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal total;
    private OffsetDateTime createdAt;
}
