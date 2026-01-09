package com.eaut.backend.service;

import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.PagingResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface BrandService {
    public ApiResponse<PagingResponse<BrandResponse>> findAll(
            String searchText,
            String sort,
            int pageNumber,
            int pageSize);

    public BrandResponse findById(UUID id);

    public BrandResponse create(BrandRequest request);

    public BrandResponse update(UUID id, BrandRequest request);

    public void delete(UUID id);

    /**
     * Tạo brand mới với upload logo
     * 
     * @param name     Tên brand
     * @param logoFile File logo (có thể null)
     * @return BrandResponse
     */
    public BrandResponse createWithLogo(String name, MultipartFile logoFile);

    /**
     * Cập nhật brand với upload logo mới
     * 
     * @param id       ID của brand
     * @param name     Tên brand mới (có thể null nếu không thay đổi)
     * @param logoFile File logo mới (có thể null nếu không thay đổi)
     * @return BrandResponse
     */
    public BrandResponse updateWithLogo(UUID id, String name, MultipartFile logoFile);
}
