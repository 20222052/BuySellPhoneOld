package com.eaut.backend.service.impl;

import com.eaut.backend.entities.Category;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.CategoryRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CategoryResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.CategoryRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.CategoryService;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public CategoryResponse findById(UUID id) {
        // Sử dụng query mới với fetch join
        Category category = categoryRepository.findByIdWithAuditors(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

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
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "Name is required");
        }
        if (categoryRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Category name already exists");
        }

        User user = getAuthenticatedUser(userRepository);
        Category newCategory = Mapper.toCategory(request);
        newCategory.setCreatedBy(user);

        Category result = categoryRepository.save(newCategory);

        return CategoryResponse.builder()
                .id(result.getId())
                .name(result.getName())
                .description(result.getDescription())
                .image(result.getImage())
                .isActive(result.isActive())
                .createdBy(user.getFullName())
                .createdAt(result.getCreatedAt())
                .updatedAt(result.getModifiedAt())
                .build();
    }

    @Override
    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

        if (request.getName() != null) {
            // Kiểm tra trùng tên nhưng loại trừ chính nó
            if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new ApplicationException(ErrorCode.CONFLICT, "Category name already exists");
            }
            category.setName(request.getName());
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

        User user = getAuthenticatedUser(userRepository);
        category.setModifiedBy(user);
        category.setModifiedAt(OffsetDateTime.now());

        Category result = categoryRepository.save(category);

        return CategoryResponse.builder()
                .id(result.getId())
                .name(result.getName())
                .description(result.getDescription())
                .image(result.getImage())
                .isActive(result.isActive())
                .createdAt(result.getCreatedAt())
                .modifiedBy(user.getFullName())
                .updatedAt(result.getModifiedAt())
                .build();
    }

    @Override
    @Transactional
    public void delete(UUID id) throws ApplicationException {
        if (id == null) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "ID is required");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

        try {
            categoryRepository.delete(category);
        } catch (DataIntegrityViolationException ex) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Cannot delete category as it is referenced by other entities.");
        }
    }
}
