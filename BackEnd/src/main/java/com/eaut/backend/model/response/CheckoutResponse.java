package com.eaut.backend.model.response;

import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentMethod;
import com.eaut.backend.constant.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {
    private UUID orderId;
    private String orderCode;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private List<OrderItemResponse> items;
    private AddressResponse shippingAddress;
    private OffsetDateTime createdAt;
}
