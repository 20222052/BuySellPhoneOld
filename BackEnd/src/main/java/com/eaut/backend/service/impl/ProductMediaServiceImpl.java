package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.ProductColor;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductMedia;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.ProductMediaRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CloudinaryResponse;
import com.eaut.backend.model.response.ProductMediaResponse;
import com.eaut.backend.repository.ProductColorRepository;
import com.eaut.backend.repository.ProductItemRepository;
import com.eaut.backend.repository.ProductMediaRepository;
import com.eaut.backend.service.ProductMediaService;
import com.eaut.backend.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductMediaServiceImpl implements ProductMediaService {
    private final ProductMediaRepository productMediaRepository;
    private final ProductItemRepository productItemRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductColorRepository productColorRepository;

    @Override
    public ApiResponse uploadProductMedia(List<MultipartFile> files, ProductMediaRequest productMediaRequest) {

        if (files == null || files.isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "No files provided for upload.");
        }
        if (productMediaRequest.getProductId() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product ID is required.");
        }

        List<CompletableFuture<CloudinaryResponse>> uploadFutures = new java.util.ArrayList<>();
        List<String> uploadedPublicIds = new java.util.ArrayList<>();

        if (!productItemRepository.existsById(productMediaRequest.getProductId())) {
            throw new ApplicationException(
                    ErrorCode.NOT_FOUND,
                    "ProductItem with ID " + productMediaRequest.getProductId() + " does not exist."
            );
        }
        ProductItem productItem = productItemRepository.getById(productMediaRequest.getProductId());
        try {
            for (MultipartFile file : files) {
                uploadFutures.add(cloudinaryService.uploadImages(file));
            }
            CompletableFuture.allOf(uploadFutures.toArray(new CompletableFuture[0])).join();

            int sortOrder = 0;
            for (CompletableFuture<CloudinaryResponse> future : uploadFutures) {
                CloudinaryResponse cloudinaryResponse = future.get();
                uploadedPublicIds.add(cloudinaryResponse.getPublicId());
                // TODO: Save ProductMedia entity with productId and publicId (url)
                log.info("Uploaded image - Public ID: {}, URL: {}", cloudinaryResponse.getPublicId(), cloudinaryResponse.getSecureUrl());

                ProductMedia.ProductMediaBuilder mediaBuilder = ProductMedia.builder()
                        .productItem(productItem)
                        .url(cloudinaryResponse.getSecureUrl())
                        .public_id(cloudinaryResponse.getPublicId())
                        .type(productMediaRequest.getType())
                        .isPrimary(sortOrder == 0 && productMediaRequest.isPrimary()) // Chỉ ảnh đầu tiên là primary
                        .sortOrder(sortOrder++);

                productMediaRepository.save(mediaBuilder.build());

            }
            return ApiResponse.builder()
                    .code(HttpStatus.OK.value())
                    .status(true)
                    .message("Upload thành công")
                    .build();
        } catch (Exception e) {
            cloudinaryService.rollbackUploadedImages(uploadedPublicIds);
            return ApiResponse.builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .status(false)
                    .message("Upload thất bại: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public ApiResponse<List<ProductMediaResponse>> getProductMediaByProductItemId(UUID ProductItemId) {
        if (ProductItemId == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product item ID is required.");
        }

        List<ProductMedia> mediaList = productMediaRepository.findByProductItemIdOrderBySortOrderAsc(ProductItemId);

        if (mediaList.isEmpty()) {
            throw new ApplicationException(ErrorCode.NOT_FOUND, "No media found for ProductItem ID: " + ProductItemId);
        }

        List<ProductMediaResponse> responses = mediaList.stream()
                .map(media -> ProductMediaResponse.builder()
                        .id(media.getId())
                        .productItemId(media.getProductItem().getId())
                        .url(media.getUrl())
                        .publicId(media.getPublic_id())
                        .type(media.getType())
                        .isPrimary(media.isPrimary())
                        .sortOrder(media.getSortOrder())
                        .build())
                .toList();

        return ApiResponse.<List<ProductMediaResponse>>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("get list ProductMedia successfully")
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Boolean> deleteProductMediaByProductItemId(UUID productItemId) {
        if (productItemId == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "ProductItem ID is required.");
        }
        List<ProductMedia> mediaList = productMediaRepository.findByProductItemId(productItemId);

        if (mediaList.isEmpty()) {
           throw  new ApplicationException(ErrorCode.NOT_FOUND, "No media found for ProductItem ID: " + productItemId);
        }

        // Xóa ảnh trên Cloudinary
        List<String> publicIds = mediaList.stream()
                .map(ProductMedia::getPublic_id)
                .filter(publicId -> publicId != null && !publicId.isEmpty())
                .toList();

        if (!publicIds.isEmpty()) {
            cloudinaryService.rollbackUploadedImages(publicIds);
        }

        // Xóa trong database
        productMediaRepository.deleteByProductItemId(productItemId);

        log.info("Deleted {} media ProductItem: {}", mediaList.size(), productItemId);

        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .status(true)
                .message("Deleted SuccessFully" + mediaList.size() + " media")
                .data(true)
                .build();
    }

//    @Override
//    @Transactional
//    public ApiResponse<List<ProductMediaResponse>> UpdateProductMediaByProductItemId(UUID id, List<ProductMediaRequest> requests) {
//        if (id == null) {
//            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "ProductItem ID is required.");
//        }
//
//        if (requests == null || requests.isEmpty()) {
//            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "ProductMediaRequest is required.");
//        }
//
//        ProductItem productItem = productItemRepository.findByProductItemId(id);
//        if (productItem == null) {
//            throw new ApplicationException(ErrorCode.NOT_FOUND, "ProductItem with ID " + id + " does not exist.");
//        }
//
//        List<ProductMedia> mediaList = productMediaRepository.findByProductItemId(id);
//        List<ProductMediaResponse> updatedResponses = new java.util.ArrayList<>();
//
//        for (ProductMediaRequest request : requests) {
//            // Tìm media theo url hoặc tạo mới logic
//            ProductMedia existingMedia = mediaList.stream()
//                    .filter(m -> m.getUrl() != null && m.getUrl().equals(request.getUrl()))
//                    .findFirst()
//                    .orElse(null);
//
//            if (existingMedia != null) {
//                // Update existing media
//                existingMedia.setPrimary(request.isPrimary());
//                existingMedia.setSortOrder(request.getSortOrder());
//                existingMedia.setType(request.getType());
//
//                // Update productColor nếu có
//                if (request.getHexCode() != null && !request.getHexCode().trim().isEmpty()) {
//                    ProductColor productColor = productColorRepository.findByHexCode(request.getHexCode());
//                    if (productColor != null) {
//                        existingMedia.setProductColor(productColor);
//                    }
//                }
//
//                ProductMedia savedMedia = productMediaRepository.save(existingMedia);
//
//                updatedResponses.add(ProductMediaResponse.builder()
//                        .id(savedMedia.getId())
//                        .productItemId(savedMedia.getProductItem().getId())
//                        .url(savedMedia.getUrl())
//                        .publicId(savedMedia.getPublic_id())
//                        .hexCode(savedMedia.getProductColor() != null ? savedMedia.getProductColor().getHexCode() : null)
//                        .type(savedMedia.getType())
//                        .isPrimary(savedMedia.isPrimary())
//                        .sortOrder(savedMedia.getSortOrder())
//                        .build());
//            }
//        }
//
//        log.info("Updated {} media ProductItem: {}", updatedResponses.size(), id);
//
//        return ApiResponse.<List<ProductMediaResponse>>builder()
//                .code(HttpStatus.OK.value())
//                .status(true)
//                .message("Update Media successfully" + updatedResponses.size() + " media")
//                .data(updatedResponses)
//                .build();
//    }
}
