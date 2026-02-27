package com.eaut.backend.controller;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.model.request.ProductRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductResponse;
import com.eaut.backend.service.AI_ChatBot.RagServiceImpl;
import com.eaut.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final RagServiceImpl ragService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagingResponse<ProductResponse>>> getAll(
            @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
            @RequestParam(name = "brand_id", required = false) UUID brandId,
            @RequestParam(name = "category_id", required = false) UUID categoryId,
            @RequestParam(name = "status", required = false) ProductStatus status,
            @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {
        ApiResponse<PagingResponse<ProductResponse>> response = productService
                .findAll(searchText, brandId, categoryId, status, sort, pageNumber, pageSize);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable UUID id) {
        ProductResponse response = productService.findById(id);
        ApiResponse<ProductResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Product retrieved successfully",
                true,
                response);
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        // ingest product items để tạo embedding sau khi tạo product thành công
        ragService.ingestProductItems(response.getId());
        log.info("ProductController: Ingest product items for productId: {}", response.getId());
        ApiResponse<ProductResponse> apiResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Product created successfully",
                true,
                response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable UUID id,
            @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        // ingest product items để cập nhật embedding sau khi cập nhật product thành công
        ragService.ingestProductItems(response.getId());
        log.info("ProductController: Ingest product items for productId: {}", response.getId());
        ApiResponse<ProductResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Product updated successfully",
                true,
                response);
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id) {
        productService.delete(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Product deleted successfully",
                true,
                null);
        return ResponseEntity.ok(apiResponse);
    }
}
