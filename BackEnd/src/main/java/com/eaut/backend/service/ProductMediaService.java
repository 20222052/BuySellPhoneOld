package com.eaut.backend.service;

import com.eaut.backend.model.request.ProductMediaRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductMediaResponse;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface ProductMediaService {
    ApiResponse<Boolean> uploadProductMedia(List<MultipartFile> files, ProductMediaRequest productMediaRequest);

    ApiResponse<List<ProductMediaResponse>> getProductMediaByProductItemId(UUID id);

    ApiResponse<Boolean> deleteProductMediaByProductItemId(UUID id);

//    ApiResponse<List<ProductMediaResponse>> UpdateProductMediaByProductItemId(UUID id, List<ProductMediaRequest> requests);
}
