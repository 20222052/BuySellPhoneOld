package com.eaut.backend.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemRequest {
    private UUID productId;
    private String name; // Tên biến thể (tùy chọn)
    private String description; // Mô tả biến thể (tùy chọn)
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;

    // List models để cascade create/update (mỗi model có thể chứa list colors)
    private List<ProductModelRequest> models;

    // List media để cascade create/update
    private List<ProductMediaRequest> mediaList;
}
