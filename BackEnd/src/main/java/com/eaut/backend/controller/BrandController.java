package com.eaut.backend.controller;

import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/brands")
public class BrandController {
    final BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagingResponse<BrandResponse>>> getAll(
            @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
            @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize
    ) {
        ApiResponse<PagingResponse<BrandResponse>> response = brandService
                .findAll(searchText, sort, pageNumber, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> create(
            @RequestBody BrandRequest request
    ) {
        BrandResponse response = brandService.create(request);
        ApiResponse <BrandResponse> apiResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Brands created successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> update(
            @PathVariable UUID id,
            @RequestBody BrandRequest request
    ) {
        BrandResponse response = brandService.update(id, request);
        ApiResponse <BrandResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Brand updated successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(
            @PathVariable UUID id
    ) {
        BrandResponse response = brandService.findById(id);
        ApiResponse <BrandResponse> apiResponse = new ApiResponse<>(
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
        brandService.delete(UUID.fromString(id));
        ApiResponse<Void> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Category deleted successfully",
                true,
                null
        );
        return ResponseEntity.ok(apiResponse);
    }
}
