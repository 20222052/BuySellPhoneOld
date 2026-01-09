package com.eaut.backend.service;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.model.request.ProductRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductResponse;

import java.util.UUID;

public interface ProductService {
    ApiResponse<PagingResponse<ProductResponse>> findAll(
            String searchText,
            UUID brandId,
            UUID categoryId,
            ProductStatus status,
            String sort,
            int pageNumber,
            int pageSize);

    ProductResponse findById(UUID id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(UUID id, ProductRequest request);

    void delete(UUID id);
}
