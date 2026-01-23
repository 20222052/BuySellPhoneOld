package com.eaut.backend.service.kafka;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent {
    private UUID orderId;
    private UUID userId;
    private String orderCode;
    private BigDecimal totalAmount;
    private String userEmail;
    private String userName;
    private OffsetDateTime createdAt;
}
