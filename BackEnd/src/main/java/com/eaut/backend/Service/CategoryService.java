package com.eaut.backend.Service;

import com.eaut.backend.Entity.Category;
import com.eaut.backend.Model.Request.CategoryRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.CategoryResponse;
import com.eaut.backend.Model.Response.PagingResponse;

import java.util.List;
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
