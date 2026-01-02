package com.eaut.backend.service.impl;

import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductModel;
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product Item Id is required");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product Name is required");
        }

        // Kiểm tra ProductItem tồn tại
        ProductItem productItem = productItemRepository.getById(request.getProductItemId());
        if (productItem == null) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ProductItem với ID " + request.getProductItemId() + " không tồn tại")
                    .data(null)
                    .build();
        }

        // Kiểm tra trùng tên model trong cùng ProductItem
        if (productModelRepository.existsByNameAndProductItemId(request.getName(), request.getProductItemId())) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("Model với tên '" + request.getName() + "' đã tồn tại trong ProductItem này")
                    .data(null)
                    .build();
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
        log.info("Tạo ProductModel thành công: {}", savedModel.getId());

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.CREATED.value())
                .status(true)
                .message("Tạo ProductModel thành công")
                .data(mapToResponse(savedModel))
                .build();
    }

    @Override
    public ApiResponse<ProductModelResponse> getProductModelById(UUID id) {
        if (id == null) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ID không được để trống")
                    .data(null)
                    .build();
        }

        ProductModel productModel = productModelRepository.findById(id).orElse(null);
        if (productModel == null) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.NOT_FOUND.value())
                    .status(false)
                    .message("Không tìm thấy ProductModel với ID: " + id)
                    .data(null)
                    .build();
        }

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Lấy ProductModel thành công")
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
                .message("Lấy danh sách ProductModel thành công")
                .data(responses)
                .build();
    }

    @Override
    public ApiResponse<List<ProductModelResponse>> getProductModelsByProductItemId(UUID productItemId) {
        if (productItemId == null) {
            return ApiResponse.<List<ProductModelResponse>>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ProductItem ID không được để trống")
                    .data(null)
                    .build();
        }

        List<ProductModel> models = productModelRepository.findByProductItemIdOrderByCreatedAtDesc(productItemId);

        List<ProductModelResponse> responses = models.stream()
                .map(this::mapToResponse)
                .toList();

        return ApiResponse.<List<ProductModelResponse>>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Lấy danh sách ProductModel thành công")
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<ProductModelResponse> updateProductModel(UUID id, ProductModelRequest request) {
        if (id == null) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ID không được để trống")
                    .data(null)
                    .build();
        }

        ProductModel existingModel = productModelRepository.findById(id).orElse(null);
        if (existingModel == null) {
            return ApiResponse.<ProductModelResponse>builder()
                    .code(HttpStatus.NOT_FOUND.value())
                    .status(false)
                    .message("Không tìm thấy ProductModel với ID: " + id)
                    .data(null)
                    .build();
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
                        .message("Model với tên '" + request.getName() + "' đã tồn tại")
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
        log.info("Cập nhật ProductModel thành công: {}", updatedModel.getId());

        return ApiResponse.<ProductModelResponse>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Cập nhật ProductModel thành công")
                .data(mapToResponse(updatedModel))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProductModel(UUID id) {
        if (id == null) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ID không được để trống")
                    .data(false)
                    .build();
        }

        if (!productModelRepository.existsById(id)) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.NOT_FOUND.value())
                    .status(false)
                    .message("Không tìm thấy ProductModel với ID: " + id)
                    .data(false)
                    .build();
        }

        productModelRepository.deleteById(id);
        log.info("Xóa ProductModel thành công: {}", id);

        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Xóa ProductModel thành công")
                .data(true)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProductModelsByProductItemId(UUID productItemId) {
        if (productItemId == null) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .status(false)
                    .message("ProductItem ID không được để trống")
                    .data(false)
                    .build();
        }

        List<ProductModel> models = productModelRepository.findByProductItemId(productItemId);
        if (models.isEmpty()) {
            return ApiResponse.<Boolean>builder()
                    .code(HttpStatus.OK.value())
                    .status(true)
                    .message("Không có ProductModel nào để xóa")
                    .data(true)
                    .build();
        }

        productModelRepository.deleteByProductItemId(productItemId);
        log.info("Xóa {} ProductModel của ProductItem: {}", models.size(), productItemId);

        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Xóa thành công " + models.size() + " ProductModel")
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
