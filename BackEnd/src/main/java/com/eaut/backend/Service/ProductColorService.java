package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.BrandRequest;
import com.eaut.backend.Model.Request.ProductColorRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.BrandResponse;
import com.eaut.backend.Model.Response.PagingResponse;
import com.eaut.backend.Model.Response.ProductColorResponse;

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
