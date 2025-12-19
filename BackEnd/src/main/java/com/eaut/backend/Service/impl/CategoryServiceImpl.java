package com.eaut.backend.Service.impl;

import com.eaut.backend.Entity.Category;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.CategoryRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.CategoryResponse;
import com.eaut.backend.Model.Response.PagingResponse;
import com.eaut.backend.Repository.CategoryRepository;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.CategoryService;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import org.hibernate.type.descriptor.jdbc.NVarcharJdbcType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static com.eaut.backend.untils.AuthDetails.getAuthenticatedUser;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    final CategoryRepository categoryRepository;
    final UserRepository userRepository;

    @Override
    public ApiResponse<PagingResponse<CategoryResponse>> findAll(
            String searchText,
            String sort,
            String isActive,
            int pageNumber,
            int pageSize) {

        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<Category> result = categoryRepository.getAllCategories(
                pattern,
                isActive,
                pageable);

        List<CategoryResponse> categories = result.stream()
                .map(Mapper::toCategoryResponse)
                .toList();

        PagingResponse<CategoryResponse> response = PagingResponse.<CategoryResponse>builder()
                .items(categories)
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
    public CategoryResponse findById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

        new CategoryResponse();
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .isActive(category.isActive())
                .createdBy(category.getCreatedBy() != null ? category.getCreatedBy().getFullName() : null)
                .createdAt(category.getCreatedAt())
                .modifiedBy(category.getModifiedBy() != null ? category.getModifiedBy().getFullName() : null)
                .updatedAt(category.getModifiedAt())
                .build();
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (request.getName().isEmpty()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "Name is required");
        }
        if (categoryRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Category name already exists");
        }

        User user = getAuthenticatedUser();
        Category newCategory = Mapper.toCategory(request);
        newCategory.setCreatedBy(user);
        Category result = categoryRepository.save(newCategory);
        new CategoryResponse();
        return CategoryResponse.builder()
                .id(result.getId())
                .name(result.getName())
                .description(result.getDescription())
                .image(result.getImage())
                .isActive(result.isActive())
                .createdAt(result.getCreatedAt())
                .updatedAt(result.getModifiedAt())
                .build();
    }

    @Override
    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));
        if (category == null) {
            throw new ApplicationException(ErrorCode.NOT_FOUND, "Category not found");
        }
        if (request.getName() != null) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new ApplicationException(ErrorCode.CONFLICT, "Category name already exists");
            } else {
                category.setName(request.getName());
            }
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImage() != null) {
            category.setImage(request.getImage());
        }
        if (request.getIsActive() != null) {
            category.setActive(request.getIsActive());
        }

        User user = getAuthenticatedUser();
        category.setModifiedBy(user);
        category.setModifiedAt(OffsetDateTime.now());
        Category result = categoryRepository.save(category);
        new CategoryResponse();
        return CategoryResponse.builder()
                .id(result.getId())
                .name(result.getName())
                .description(result.getDescription())
                .image(result.getImage())
                .isActive(result.isActive())
                .createdAt(result.getCreatedAt())
                .updatedAt(result.getModifiedAt())
                .build();
    }

    @Override
    @Transactional
    public void delete(UUID id) throws ApplicationException {
        if (id == null || id.toString().isEmpty()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "ID is required");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

        try {
            categoryRepository.delete(category);

        } catch (DataIntegrityViolationException ex) {
            // Lỗi FK → không cho xóa
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Cannot delete category as it is referenced by other entities.");
        }
    }

}
