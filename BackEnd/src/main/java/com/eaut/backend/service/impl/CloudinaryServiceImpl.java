package com.eaut.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eaut.backend.model.response.CloudinaryResponse;
import com.eaut.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    @Async("taskExecutor")
    public CompletableFuture<CloudinaryResponse> uploadImages(MultipartFile file) throws Exception {
//        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "products",           // 👈 folder Cloudinary
                "resource_type", "auto",
                "quality", "auto",              // tối ưu dung lượng
                "fetch_format", "auto"           // auto webp / jpg
        );

        Map uploadResult = cloudinary.uploader()
                .upload(file.getBytes(), options);

        return CompletableFuture.completedFuture(
                CloudinaryResponse.builder()
                        .publicId((String) uploadResult.get("public_id"))
                        .secureUrl((String) uploadResult.get("secure_url"))
                        .build()
        );

    }

    @Override
    public void rollbackUploadedImages(List<String> publicIds) {
        for (String publicId : publicIds) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            Map result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "auto")
            );

            String status = (String) result.get("result");

            if (!"ok".equals(status) && !"not found".equals(status)) {
                throw new IllegalStateException(
                        "Cloudinary delete failed, status=" + status
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("Delete image failed: " + publicId, e);
        }
    }


    public void deleteProductItemImages(UUID productItemId) {
        try {
            cloudinary.api().deleteResourcesByPrefix(
                    "products/" + productItemId,
                    ObjectUtils.emptyMap()
            );
        } catch (Exception e) {
            log.error("Failed to delete images of productItem={}", productItemId, e);
        }
    }


}
