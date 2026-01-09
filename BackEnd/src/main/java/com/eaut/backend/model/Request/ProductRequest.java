package com.eaut.backend.model.request;

import com.eaut.backend.constant.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private UUID brandId;
    private UUID categoryId;
    private Integer warrantyMonths;
    private ProductStatus status;
}
