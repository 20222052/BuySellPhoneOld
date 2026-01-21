package com.eaut.backend.service;

import com.eaut.backend.model.request.BlogRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BlogResponse;
import com.eaut.backend.model.response.PagingResponse;

import java.util.UUID;

public interface BlogService {

    /**
     * Lấy danh sách tất cả blogs với phân trang và tìm kiếm
     */
    ApiResponse<PagingResponse<BlogResponse>> findAll(
            String searchText,
            String sort,
            int pageNumber,
            int pageSize);

    /**
     * Lấy chi tiết blog theo ID
     */
    BlogResponse findById(UUID id);

    /**
     * Lấy chi tiết blog theo ID và tăng lượt xem
     */
    BlogResponse findByIdAndIncrementView(UUID id);

    /**
     * Tạo blog mới
     *
     * @param request Thông tin blog
     * @param userId  ID của user tạo blog
     */
    BlogResponse create(BlogRequest request, UUID userId);

    /**
     * Cập nhật blog
     *
     * @param id      ID của blog cần cập nhật
     * @param request Thông tin cập nhật
     * @param userId  ID của user cập nhật
     */
    BlogResponse update(UUID id, BlogRequest request, UUID userId);

    /**
     * Xóa blog
     *
     * @param id ID của blog cần xóa
     */
    void delete(UUID id);

    /**
     * Lấy danh sách blogs của một user
     */
    ApiResponse<PagingResponse<BlogResponse>> findByUserId(
            UUID userId,
            String sort,
            int pageNumber,
            int pageSize);
}
