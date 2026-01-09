package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductModel;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.ProductModelRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductModelResponse;
import com.eaut.backend.repository.ProductItemRepository;
import com.eaut.backend.repository.ProductModelRepository;
import com.eaut.backend.service.ProductModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductModelServiceImpl implements ProductModelService {
    private final ProductModelRepository productModelRepository;
    private final ProductItemRepository productItemRepository;

    @Override
    @Transactional
    public ApiResponse<ProductModelResponse> createProductModel(ProductModelRequest request) {
        // Validate input
        if (request.getProductItemId() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Item Id is required");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Name is required");
        }

        // Kiểm tra ProductItem tồn tại
        ProductItem productItem = productItemRepository.getById(request.getProductItemId());
        if (productItem == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "ProductItem ID '" + request.getProductItemId() + "' not found");
        }

        // Kiểm tra trùng tên model trong cùng ProductItem
        if (productModelRepository.existsByNameAndProductItemId(request.getName(), request.getProductItemId())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "ModelName '" + request.getName() + "' already exists by ProductItem ID '" + request.getProductItemId() + "'");
        }

        // Tạo ProductModel mới
        ProductModel productModel = ProductModel.builder()
                .productItem(productItem)
                .name(request.getName())
                .ramGb(request.getRamGb())
                .romGb(request.getRomGb())
                .grade(request.getGrade())
                .description(request.getDescription())
                .build();

        ProductModel savedModel = productModelRepository.save(productModel);
        log.info("create ProductModel SuccessFully: {}", savedModel.getId());

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.CREATED.value())
                .status(true)
                .message("create ProductModel SuccessFully")
                .data(mapToResponse(savedModel))
                .build();
    }

    @Override
    public ApiResponse<ProductModelResponse> getProductModelById(UUID id) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Model ID is required");
        }

        ProductModel productModel = productModelRepository.findById(id).orElse(null);
        if (productModel == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "ProductModel ID '" + id + "' not found");
        }

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Get ProductModel SuccessFully")
                .data(mapToResponse(productModel))
                .build();
    }

    @Override
    public ApiResponse<List<ProductModelResponse>> getAllProductModels() {
        List<ProductModel> models = productModelRepository.findAll();

        List<ProductModelResponse> responses = models.stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.<List<ProductModelResponse>>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Get all ProductModels SuccessFully")
                .data(responses)
                .build();
    }

    @Override
    public ApiResponse<List<ProductModelResponse>> getProductModelsByProductItemId(UUID productItemId) {
        if (productItemId == null) {
            throw  new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Item ID is required");
        }

        List<ProductModel> models = productModelRepository.findByProductItemIdOrderByCreatedAtDesc(productItemId);

        List<ProductModelResponse> responses = models.stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.<List<ProductModelResponse>>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Get ProductModels by ProductItem ID SuccessFully")
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ProductModelResponse> updateProductModel(UUID id, ProductModelRequest request) {
        if (id == null) {
            throw new  ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Model ID is required");
        }

        ProductModel existingModel = productModelRepository.findById(id).orElse(null);
        if (existingModel == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "ProductModel ID '" + id + "' not found");
        }

        // Update fields nếu có giá trị mới
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            // Kiểm tra trùng tên (trừ chính nó)
            if (!existingModel.getName().equals(request.getName()) &&
                    productModelRepository.existsByNameAndProductItemId(request.getName(),
                            existingModel.getProductItem().getId())) {
                return ApiResponse.<ProductModelResponse>builder()
                        .code(HttpStatus.BAD_REQUEST.value())
                        .status(false)
                        .message("Model with name '" + request.getName() + "' already exists for this ProductItem")
                        .data(null)
                        .build();
            }
            existingModel.setName(request.getName());
        }

        if (request.getRamGb() != null) {
            existingModel.setRamGb(request.getRamGb());
        }

        if (request.getRomGb() != null) {
            existingModel.setRomGb(request.getRomGb());
        }

        if (request.getGrade() != null) {
            existingModel.setGrade(request.getGrade());
        }

        if (request.getDescription() != null) {
            existingModel.setDescription(request.getDescription());
        }

        ProductModel updatedModel = productModelRepository.save(existingModel);
        log.info("Update ProductModel SuccessFully: {}", updatedModel.getId());

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Update ProductModel SuccessFully")
                .data(mapToResponse(updatedModel))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProductModel(UUID id) {
        if (id == null) {
            throw  new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Model ID is required");
        }

        if (!productModelRepository.existsById(id)) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "ProductModel ID '" + id + "' not found");
        }

        productModelRepository.deleteById(id);
        log.info("Delete ProductModel SuccessFully: {}", id);

        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Delete ProductModel SuccessFully")
                .data(true)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProductModelsByProductItemId(UUID productItemId) {
        if (productItemId == null) {
            throw   new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product Item ID is required");
        }

        List<ProductModel> models = productModelRepository.findByProductItemId(productItemId);
        if (models.isEmpty()) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .status(true)
                    .message("No ProductModels found for ProductItem ID '" + productItemId + "'")
                    .data(true)
                    .build();
        }

        productModelRepository.deleteByProductItemId(productItemId);
        log.info("Delete {} ProductModel with ProductItem: {}", models.size(), productItemId);

        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Delete SuccessFully " + models.size() + " ProductModel")
                .data(true)
                .build();
    }

    // Helper method để map Entity sang Response
    private ProductModelResponse mapToResponse(ProductModel model) {
        return ProductModelResponse.builder()
                .id(model.getId())
                .productItemId(model.getProductItem().getId())
                .name(model.getName())
                .ramGb(model.getRamGb())
                .romGb(model.getRomGb())
                .grade(model.getGrade())
                .description(model.getDescription())
                .createdAt(model.getCreatedAt())
                .build();
    }
}
