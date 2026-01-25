package com.eaut.backend.service;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.model.request.ProductItemRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductItemListResponse;
import com.eaut.backend.model.response.ProductItemResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface ProductItemService {
        ApiResponse<PagingResponse<ProductItemResponse>> findAll(
                        String searchText,
                        UUID productId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        String sort,
                        int pageNumber,
                        int pageSize);

        /**
         * Get all product items for list display with full info:
         * - Product, Brand, Category info
         * - Primary image
         * - Rating stats (average, count)
         * - Discount percentage
         */
        ApiResponse<PagingResponse<ProductItemListResponse>> findAllForList(
                        String searchText,
                        UUID productId,
                        UUID brandId,
                        UUID categoryId,
                        ProductStatus status,
                        BigDecimal minPrice,
                        BigDecimal maxPrice,
                        Integer isTradeIn,
                        String sortBy,
                        String sortDir,
                        Boolean randomEnabled,
                        int pageNumber,
                        int pageSize);

        ProductItemResponse findById(UUID id);

        ProductItemDetailResponse findByIdWithDetails(UUID id);

        ProductItemResponse create(ProductItemRequest request);

        ProductItemResponse update(UUID id, ProductItemRequest request);

        ProductItemResponse updateStatus(UUID id, ProductStatus status);

        ProductItemResponse updateTradeIn(UUID id, Integer isTradeIn);

        void delete(UUID id);
}
