package com.eaut.backend.service.impl;

import com.eaut.backend.entities.Brand;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.CloudinaryResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.BrandRepository;
import com.eaut.backend.service.BrandService;
import com.eaut.backend.service.CloudinaryService;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    final BrandRepository brandRepository;
    final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    @Override
    public ApiResponse<PagingResponse<BrandResponse>> findAll(String searchText, String sort, int pageNumber,
            int pageSize) {
        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<Brand> result = brandRepository.getAllBrands(
                pattern,
                pageable);

        List<BrandResponse> brands = result.stream()
                .map(Mapper::toBrandResponse)
                .toList();

        PagingResponse<BrandResponse> response = PagingResponse.<BrandResponse>builder()
                .items(brands)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return new ApiResponse<>(
                HttpStatus.OK.value(),
                response);
    }

    @Transactional(readOnly = true)
    @Override
    public BrandResponse findById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        return Mapper.toBrandResponse(brand);
    }

    @Override
    public BrandResponse create(BrandRequest request) {
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand name is required");
        }
        if (brandRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Brand name already exists");
        }
        Brand brand = brandRepository.save(Mapper.toBrand(request));
        return Mapper.toBrandResponse(brand);
    }

    @Override
    public BrandResponse update(UUID id, BrandRequest request) {
        if (id == null || id.toString().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand id is required");
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Brand not found"));
        if (request.getName() != null || !request.getName().isEmpty()) {
            brand.setName(request.getName());
        }
        if (brandRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Brand name already exists");
        }
        if (request.getLogoUrl() != null && !request.getLogoUrl().isEmpty()) {
            brand.setLogoUrl(request.getLogoUrl());
        }
        Brand updatedBrand = brandRepository.save(brand);
        return Mapper.toBrandResponse(updatedBrand);
    }

    @Override
    public void delete(UUID id) {
        if (id == null || id.toString().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand id is required");
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Brand not found"));

        // Xóa logo trên Cloudinary nếu có
        if (brand.getLogoUrl() != null && !brand.getLogoUrl().isEmpty()) {
            try {
                String publicId = extractPublicIdFromUrl(brand.getLogoUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                    log.info("Deleted logo from Cloudinary: {}", publicId);
                }
            } catch (Exception e) {
                log.warn("Failed to delete logo from Cloudinary: {}", e.getMessage());
            }
        }

        brandRepository.delete(brand);
    }

    @Override
    @Transactional
    public BrandResponse createWithLogo(String name, MultipartFile logoFile) {
        log.info("Creating brand with logo upload: {}", name);

        if (name == null || name.trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand name is required");
        }
        if (brandRepository.existsByName(name.trim())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Brand name already exists");
        }

        String logoUrl = null;

        // Upload logo nếu có
        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                CompletableFuture<CloudinaryResponse> uploadFuture = cloudinaryService.uploadImages(logoFile);
                CloudinaryResponse cloudinaryResponse = uploadFuture.get(); // Block để lấy kết quả
                logoUrl = cloudinaryResponse.getSecureUrl();
                log.info("Logo uploaded successfully: {}", logoUrl);
            } catch (Exception e) {
                log.error("Failed to upload logo to Cloudinary: {}", e.getMessage());
                throw new ApplicationException(ErrorCode.FILE_UPLOAD_FAILED,
                        "Failed to upload logo: " + e.getMessage());
            }
        }

        Brand brand = Brand.builder()
                .name(name.trim())
                .logoUrl(logoUrl)
                .build();

        Brand savedBrand = brandRepository.save(brand);
        log.info("Brand created successfully: id={}, name={}", savedBrand.getId(), savedBrand.getName());

        return Mapper.toBrandResponse(savedBrand);
    }

    @Override
    @Transactional
    public BrandResponse updateWithLogo(UUID id, String name, MultipartFile logoFile) {
        log.info("Updating brand with logo: id={}, name={}", id, name);

        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand id is required");
        }

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Brand not found"));

        // Cập nhật tên nếu có
        if (name != null && !name.trim().isEmpty()) {
            if (brandRepository.existsByNameAndIdNot(name.trim(), id)) {
                throw new ApplicationException(ErrorCode.CONFLICT, "Brand name already exists");
            }
            brand.setName(name.trim());
        }

        // Upload logo mới nếu có
        if (logoFile != null && !logoFile.isEmpty()) {
            // Xóa logo cũ trên Cloudinary nếu có
            String oldLogoUrl = brand.getLogoUrl();
            if (oldLogoUrl != null && !oldLogoUrl.isEmpty()) {
                try {
                    String oldPublicId = extractPublicIdFromUrl(oldLogoUrl);
                    if (oldPublicId != null) {
                        cloudinaryService.deleteImage(oldPublicId);
                        log.info("Deleted old logo from Cloudinary: {}", oldPublicId);
                    }
                } catch (Exception e) {
                    log.warn("Failed to delete old logo from Cloudinary: {}", e.getMessage());
                }
            }

            // Upload logo mới
            try {
                CompletableFuture<CloudinaryResponse> uploadFuture = cloudinaryService.uploadImages(logoFile);
                CloudinaryResponse cloudinaryResponse = uploadFuture.get();
                brand.setLogoUrl(cloudinaryResponse.getSecureUrl());
                log.info("New logo uploaded successfully: {}", cloudinaryResponse.getSecureUrl());
            } catch (Exception e) {
                log.error("Failed to upload new logo to Cloudinary: {}", e.getMessage());
                throw new ApplicationException(ErrorCode.FILE_UPLOAD_FAILED,
                        "Failed to upload logo: " + e.getMessage());
            }
        }

        Brand updatedBrand = brandRepository.save(brand);
        log.info("Brand updated successfully: id={}, name={}", updatedBrand.getId(), updatedBrand.getName());

        return Mapper.toBrandResponse(updatedBrand);
    }

    /**
     * Trích xuất public_id từ Cloudinary URL
     * VD: https://res.cloudinary.com/xxx/image/upload/v123/products/abc.jpg ->
     * products/abc
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty())
            return null;
        try {
            // URL format:
            // https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            String[] parts = url.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Bỏ version (v123456789/)
                if (pathWithVersion.startsWith("v") && pathWithVersion.contains("/")) {
                    pathWithVersion = pathWithVersion.substring(pathWithVersion.indexOf("/") + 1);
                }
                // Bỏ extension
                int lastDot = pathWithVersion.lastIndexOf(".");
                if (lastDot > 0) {
                    return pathWithVersion.substring(0, lastDot);
                }
                return pathWithVersion;
            }
        } catch (Exception e) {
            log.warn("Failed to extract public_id from URL: {}", url);
        }
        return null;
    }
}
