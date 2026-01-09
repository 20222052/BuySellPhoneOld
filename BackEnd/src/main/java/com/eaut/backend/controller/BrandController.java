package com.eaut.backend.controller;

import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/brands")
public class BrandController {
        final BrandService brandService;

        @GetMapping
        public ResponseEntity<ApiResponse<PagingResponse<BrandResponse>>> getAll(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {
                ApiResponse<PagingResponse<BrandResponse>> response = brandService
                                .findAll(searchText, sort, pageNumber, pageSize);
                return ResponseEntity.ok(response);
        }

        @PostMapping
        public ResponseEntity<ApiResponse<BrandResponse>> create(
                        @RequestBody BrandRequest request) {
                BrandResponse response = brandService.create(request);
                ApiResponse<BrandResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.CREATED.value(),
                                "Brands created successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        /**
         * Tạo brand mới với upload logo
         */
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<BrandResponse>> createWithLogo(
                        @RequestParam("name") String name,
                        @RequestParam(value = "logo", required = false) MultipartFile logoFile) {
                log.info("Creating brand with logo upload: name={}, hasFile={}", name,
                                logoFile != null && !logoFile.isEmpty());
                BrandResponse response = brandService.createWithLogo(name, logoFile);
                ApiResponse<BrandResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.CREATED.value(),
                                "Brand created successfully with logo",
                                true,
                                response);
                return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<BrandResponse>> update(
                        @PathVariable UUID id,
                        @RequestBody BrandRequest request) {
                BrandResponse response = brandService.update(id, request);
                ApiResponse<BrandResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Brand updated successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        /**
         * Cập nhật brand với upload logo mới
         */
        @PutMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<BrandResponse>> updateWithLogo(
                        @PathVariable UUID id,
                        @RequestParam(value = "name", required = false) String name,
                        @RequestParam(value = "logo", required = false) MultipartFile logoFile) {
                log.info("Updating brand with logo: id={}, name={}, hasFile={}", id, name,
                                logoFile != null && !logoFile.isEmpty());
                BrandResponse response = brandService.updateWithLogo(id, name, logoFile);
                ApiResponse<BrandResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Brand updated successfully with logo",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(
                        @PathVariable UUID id) {
                BrandResponse response = brandService.findById(id);
                ApiResponse<BrandResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Category retrieved successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @DeleteMapping
        public ResponseEntity<ApiResponse<Void>> deleteCategory(
                        @RequestParam(name = "id") String id) {
                brandService.delete(UUID.fromString(id));
                ApiResponse<Void> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Category deleted successfully",
                                true,
                                null);
                return ResponseEntity.ok(apiResponse);
        }
}
