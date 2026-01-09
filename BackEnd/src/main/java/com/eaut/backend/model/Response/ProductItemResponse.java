package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
