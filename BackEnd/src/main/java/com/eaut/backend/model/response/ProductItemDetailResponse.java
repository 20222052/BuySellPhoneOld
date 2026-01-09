package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemDetailResponse {
    private UUID id;

    // Product info
    private UUID productId;
    private String productName;
    private String productDescription;
    private String brandName;
    private String categoryName;
    private Integer warrantyMonths;

    // Price info
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;
    private Integer qtyAvailable;

    // Related data
    private List<ProductModelDetailResponse> models;
    private List<ProductMediaResponse> media;
    private List<ProductRatingResponse> ratings;

    // Aggregate rating info
    private Double averageRating;
    private Integer totalRatings;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
