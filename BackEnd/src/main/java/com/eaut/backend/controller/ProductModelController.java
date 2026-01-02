package com.eaut.backend.controller;

import com.eaut.backend.model.request.ProductModelRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductModelResponse;
import com.eaut.backend.service.ProductModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/product-models")
public class ProductModelController {
    private final ProductModelService productModelService;

    /**
     * Tạo ProductModel mới
     * POST /product-models
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductModelResponse>> createProductModel(
            @RequestBody ProductModelRequest request) {
        log.info("Tạo ProductModel mới: {}", request.getName());
        ApiResponse<ProductModelResponse> response = productModelService.createProductModel(request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Lấy ProductModel theo ID
     * GET /product-models/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> getProductModelById(@PathVariable UUID id) {
        log.info("Lấy ProductModel theo ID: {}", id);
        ApiResponse<ProductModelResponse> response = productModelService.getProductModelById(id);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Lấy tất cả ProductModel
     * GET /product-models
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductModelResponse>>> getAllProductModels() {
        log.info("Lấy tất cả ProductModel");
        ApiResponse<List<ProductModelResponse>> response = productModelService.getAllProductModels();
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Lấy ProductModel theo ProductItem ID
     * GET /product-models/product-item/{productItemId}
     */
    @GetMapping("/product-item/{productItemId}")
    public ResponseEntity<ApiResponse<List<ProductModelResponse>>> getProductModelsByProductItemId(
            @PathVariable UUID productItemId) {
        log.info("Lấy ProductModel theo ProductItem ID: {}", productItemId);
        ApiResponse<List<ProductModelResponse>> response = productModelService
                .getProductModelsByProductItemId(productItemId);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Cập nhật ProductModel
     * PUT /product-models/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModel(
            @PathVariable UUID id,
            @RequestBody ProductModelRequest request) {
        log.info("Cập nhật ProductModel ID: {}", id);
        ApiResponse<ProductModelResponse> response = productModelService.updateProductModel(id, request);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Xóa ProductModel theo ID
     * DELETE /product-models/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> deleteProductModel(@PathVariable UUID id) {
        log.info("Xóa ProductModel ID: {}", id);
        ApiResponse<Boolean> response = productModelService.deleteProductModel(id);
        return ResponseEntity.status(response.getCode()).body(response);
    }

    /**
     * Xóa tất cả ProductModel theo ProductItem ID
     * DELETE /product-models/product-item/{productItemId}
     */
    @DeleteMapping("/product-item/{productItemId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteProductModelsByProductItemId(
            @PathVariable UUID productItemId) {
        log.info("Xóa tất cả ProductModel của ProductItem ID: {}", productItemId);
        ApiResponse<Boolean> response = productModelService.deleteProductModelsByProductItemId(productItemId);
        return ResponseEntity.status(response.getCode()).body(response);
    }
}
