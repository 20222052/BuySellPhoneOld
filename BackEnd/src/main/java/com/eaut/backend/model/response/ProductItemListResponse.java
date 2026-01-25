package com.eaut.backend.model.response;

import com.eaut.backend.constant.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO cho danh sách ProductItem với thông tin tóm tắt
 * Bao gồm: thông tin sản phẩm, giá, ảnh đại diện, rating
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemListResponse {
    private UUID id;

    // ProductItem name (variant name)
    private String name;
    private String description; // ProductItem description (variant description)
    private String status;

    // Product info
    private UUID productId;
    private String productName;
    private String productDescription;
    private String productStatus;

    // Brand & Category
    private UUID brandId;
    private String brandName;
    private String brandLogoUrl;
    private UUID categoryId;
    private String categoryName;

    // Price info
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;

    // Discount percentage (calculated)
    private Integer discountPercent;

    // Primary image (first image or isPrimary = true)
    private String primaryImageUrl;
    private String primaryImagePublicId;

    // Rating info (aggregated)
    private Double averageRating;
    private Integer totalRatings;

    // Model & Color counts
    private Integer modelCount;
    private Integer colorCount;
    private Integer qtyAvailable;

    // Trade-in status
    private Integer isTradeIn;

    // Warranty
    private Integer warrantyMonths;

    // Timestamps
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
