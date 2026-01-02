package com.eaut.backend.service;

import com.eaut.backend.model.request.ProductColorRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductColorResponse;

import java.util.UUID;

public interface ProductColorService {
    public ApiResponse<PagingResponse<ProductColorResponse>> findAll(
            String searchText,
            String sort,
            int pageNumber,
            int pageSize);
    public ProductColorResponse findById(UUID id);
    public ProductColorResponse create(ProductColorRequest request);
    public ProductColorResponse update(UUID id, ProductColorRequest request);
    public void delete(UUID id);
}
