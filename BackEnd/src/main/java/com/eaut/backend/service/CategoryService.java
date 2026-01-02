package com.eaut.backend.service;

import com.eaut.backend.model.request.CategoryRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CategoryResponse;
import com.eaut.backend.model.response.PagingResponse;

import java.util.UUID;

public interface CategoryService {
    public ApiResponse<PagingResponse<CategoryResponse>> findAll(
            String searchText,
            String sort,
            String isActive,
            int pageNumber,
            int pageSize);
    public CategoryResponse findById(UUID id);
    public CategoryResponse create(CategoryRequest request);
    public CategoryResponse update(UUID id, CategoryRequest request);
    public void delete(UUID id);
}
