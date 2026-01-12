package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private UUID id;
    private UUID userId;
    private UUID productColorId;
    private String productName;
    private String colorName;
    private String productModelName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    private ProductItemDetailResponse productDetail;
}
