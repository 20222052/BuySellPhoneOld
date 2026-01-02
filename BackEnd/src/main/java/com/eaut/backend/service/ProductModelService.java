package com.eaut.backend.service;

import com.eaut.backend.model.request.ProductModelRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductModelResponse;

import java.util.List;
import java.util.UUID;

public interface ProductModelService {

    ApiResponse<ProductModelResponse> createProductModel(ProductModelRequest request);

    ApiResponse<ProductModelResponse> getProductModelById(UUID id);

    ApiResponse<List<ProductModelResponse>> getAllProductModels();

    ApiResponse<List<ProductModelResponse>> getProductModelsByProductItemId(UUID productItemId);

    ApiResponse<ProductModelResponse> updateProductModel(UUID id, ProductModelRequest request);

    ApiResponse<Boolean> deleteProductModel(UUID id);

    ApiResponse<Boolean> deleteProductModelsByProductItemId(UUID productItemId);
}
