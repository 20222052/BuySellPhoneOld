package com.eaut.backend.controller;

import com.eaut.backend.model.request.ProductMediaRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductMediaResponse;
import com.eaut.backend.service.ProductMediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/product-medias")
public class ProductMediaController {
    private final ProductMediaService productMediaService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Boolean>> uploadProductMedia(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("productItemId") UUID productItemId,
            @RequestParam("hexCode") String hexCode,
            @RequestParam("isPrimary") Boolean isPrimary
    ) {
        ApiResponse<Boolean> response = productMediaService.
                uploadProductMedia(files, ProductMediaRequest.builder()
                        .productId(productItemId)
                        .isPrimary(isPrimary)
                        .build());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductMediaResponse>>> getProductMediaByProductId(
            @RequestParam("productItemId") UUID productItemId) {
        ApiResponse<List<ProductMediaResponse>> response = productMediaService.getProductMediaByProductItemId(productItemId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Boolean>> deleteProductMediaByProductItemId(
            @RequestParam("productItemId") UUID productItemId) {
        ApiResponse<Boolean> response = productMediaService.deleteProductMediaByProductItemId(productItemId);
        return ResponseEntity.ok(response);
    }
}
