package com.eaut.backend.model.request;

import com.eaut.backend.constant.PaymentMethod;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
    private UUID userId;
    private UUID addressId;
    private PaymentMethod paymentMethod;
    private String note;
}
