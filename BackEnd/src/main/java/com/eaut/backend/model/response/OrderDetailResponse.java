package com.eaut.backend.model.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OrderDetailResponse extends OrderResponse {
    private String shippingAddress;
    private String shippingPhone;
    private String shippingFullName;
    private List<OrderItemResponse> items;
}
