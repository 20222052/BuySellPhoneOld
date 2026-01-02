package com.eaut.backend.service;

import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.PagingResponse;

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
