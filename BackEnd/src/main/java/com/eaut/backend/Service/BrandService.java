package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.BrandRequest;
import com.eaut.backend.Model.Request.CategoryRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.BrandResponse;
import com.eaut.backend.Model.Response.CategoryResponse;
import com.eaut.backend.Model.Response.PagingResponse;

import java.util.UUID;

public interface BrandService {
    public ApiResponse<PagingResponse<BrandResponse>> findAll(
            String searchText,
            String sort,
            int pageNumber,
            int pageSize);
    public BrandResponse findById(UUID id);
    public BrandResponse create(BrandRequest request);
    public BrandResponse update(UUID id, BrandRequest request);
    public void delete(UUID id);
}
