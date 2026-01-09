package com.eaut.backend.controller;

import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CloudinaryResponse;
import com.eaut.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/upload")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload nhiều ảnh lên Cloudinary
     * Trả về danh sách URL và publicId
     */
    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<CloudinaryResponse>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files) {

        log.info("Uploading {} images to Cloudinary", files.size());

        try {
            List<CompletableFuture<CloudinaryResponse>> futures = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    futures.add(cloudinaryService.uploadImages(file));
                }
            }

            // Wait for all uploads to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            List<CloudinaryResponse> results = new ArrayList<>();
            for (CompletableFuture<CloudinaryResponse> future : futures) {
                results.add(future.get());
            }

            log.info("Successfully uploaded {} images", results.size());

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Images uploaded successfully",
                    true,
                    results));
        } catch (Exception e) {
            log.error("Error uploading images: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Failed to upload images: " + e.getMessage(),
                            false,
                            null));
        }
    }

    /**
     * Upload một ảnh lên Cloudinary
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CloudinaryResponse>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading single image to Cloudinary");

        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                HttpStatus.BAD_REQUEST.value(),
                                "File is required",
                                false,
                                null));
            }

            CloudinaryResponse result = cloudinaryService.uploadImages(file).get();

            log.info("Successfully uploaded image: {}", result.getPublicId());

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Image uploaded successfully",
                    true,
                    result));
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Failed to upload image: " + e.getMessage(),
                            false,
                            null));
        }
    }

    /**
     * Xóa ảnh khỏi Cloudinary
     */
    @DeleteMapping("/image/{publicId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteImage(
            @PathVariable String publicId) {

        log.info("Deleting image from Cloudinary: {}", publicId);

        try {
            cloudinaryService.deleteImage(publicId);

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Image deleted successfully",
                    true,
                    true));
        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Failed to delete image: " + e.getMessage(),
                            false,
                            false));
        }
    }
}
