package com.eaut.backend.service;

import com.eaut.backend.model.response.CloudinaryResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public interface CloudinaryService {
    @Async
    CompletableFuture<CloudinaryResponse> uploadImages(MultipartFile file) throws Exception;

    void rollbackUploadedImages(java.util.List<String> publicIds);

    void deleteImage(String publicId);

    void deleteProductItemImages(UUID productItemId);

}
