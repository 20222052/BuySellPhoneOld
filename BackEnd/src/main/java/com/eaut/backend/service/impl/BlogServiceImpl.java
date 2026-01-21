package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.Blog;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.BlogRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BlogResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.BlogRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.BlogService;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<BlogResponse>> findAll(String searchText, String sort, int pageNumber,
            int pageSize) {
        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<Blog> result = blogRepository.getAllBlogs(pattern, pageable);

        List<BlogResponse> blogs = result.stream()
                .map(Mapper::toBlogResponse)
                .toList();

        PagingResponse<BlogResponse> response = PagingResponse.<BlogResponse>builder()
                .items(blogs)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return new ApiResponse<>(
                HttpStatus.OK.value(),
                response);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogResponse findById(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Blog not found"));
        return Mapper.toBlogResponse(blog);
    }

    @Override
    @Transactional
    public BlogResponse findByIdAndIncrementView(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Blog not found"));

        // Increment view count
        blogRepository.incrementViewCount(id);
        blog.setViewCount(blog.getViewCount() + 1);

        return Mapper.toBlogResponse(blog);
    }

    @Override
    @Transactional
    public BlogResponse create(BlogRequest request, UUID userId) {
        log.info("Creating blog with title: {} by user: {}", request.getTitle(), userId);

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Blog title is required");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Blog content is required");
        }

        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Blog blog = Blog.builder()
                .title(request.getTitle().trim())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .author(request.getAuthor() != null ? request.getAuthor() : createdBy.getFullName())
                .build();
        blog.setCreatedBy(createdBy);

        Blog savedBlog = blogRepository.save(blog);
        log.info("Blog created successfully: id={}, title={}", savedBlog.getId(), savedBlog.getTitle());

        return Mapper.toBlogResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogResponse update(UUID id, BlogRequest request, UUID userId) {
        log.info("Updating blog: {} by user: {}", id, userId);

        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Blog id is required");
        }

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Blog not found"));

        User updatedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Update fields if provided
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            blog.setTitle(request.getTitle().trim());
        }

        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            blog.setContent(request.getContent());
        }

        if (request.getImageUrl() != null) {
            blog.setImageUrl(request.getImageUrl());
        }

        if (request.getAuthor() != null && !request.getAuthor().trim().isEmpty()) {
            blog.setAuthor(request.getAuthor().trim());
        }

        blog.setModifiedBy(updatedBy);

        Blog updatedBlog = blogRepository.save(blog);
        log.info("Blog updated successfully: id={}, title={}", updatedBlog.getId(), updatedBlog.getTitle());

        return Mapper.toBlogResponse(updatedBlog);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        log.info("Deleting blog: {}", id);

        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Blog id is required");
        }

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Blog not found"));

        blogRepository.delete(blog);
        log.info("Blog deleted successfully: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<BlogResponse>> findByUserId(UUID userId, String sort, int pageNumber,
            int pageSize) {
        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<Blog> result = blogRepository.findByCreatedById(userId, pageable);

        List<BlogResponse> blogs = result.stream()
                .map(Mapper::toBlogResponse)
                .toList();

        PagingResponse<BlogResponse> response = PagingResponse.<BlogResponse>builder()
                .items(blogs)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return new ApiResponse<>(
                HttpStatus.OK.value(),
                response);
    }
}
