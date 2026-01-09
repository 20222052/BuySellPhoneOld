package com.eaut.backend.controller;

import com.eaut.backend.model.request.CategoryRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CategoryResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/categories")
public class CategoryController {
    final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagingResponse<CategoryResponse>>> getAllUsers(
            @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
            @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
            @RequestParam(name = "isActive", required = false, defaultValue = "") String isActive,
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize
    ) {
        ApiResponse<PagingResponse<CategoryResponse>> response = categoryService
                .findAll(searchText, sort, isActive, pageNumber, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.create(request);
        ApiResponse <CategoryResponse> apiResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Category created successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.update(id, request);
        ApiResponse <CategoryResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Category updated successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable UUID id
    ) {
        CategoryResponse response = categoryService.findById(id);
        ApiResponse <CategoryResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Category retrieved successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @RequestParam(name = "id") String id
    ) {
        categoryService.delete(java.util.UUID.fromString(id));
        ApiResponse<Void> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Category deleted successfully",
                true,
                null
        );
        return ResponseEntity.ok(apiResponse);
    }
}
