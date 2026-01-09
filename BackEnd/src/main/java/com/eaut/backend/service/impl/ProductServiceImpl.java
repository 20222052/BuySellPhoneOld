package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.entities.Brand;
import com.eaut.backend.entities.Category;
import com.eaut.backend.entities.Product;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.ProductRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductResponse;
import com.eaut.backend.repository.BrandRepository;
import com.eaut.backend.repository.CategoryRepository;
import com.eaut.backend.repository.ProductRepository;
import com.eaut.backend.service.ProductService;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<ProductResponse>> findAll(
            String searchText,
            UUID brandId,
            UUID categoryId,
            ProductStatus status,
            String sort,
            int pageNumber,
            int pageSize) {

        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<Product> result = productRepository.getAllProducts(
                pattern,
                brandId,
                categoryId,
                status,
                pageable);

        List<ProductResponse> products = result.stream()
                .map(Mapper::toProductResponse)
                .toList();

        PagingResponse<ProductResponse> response = PagingResponse.<ProductResponse>builder()
                .items(products)
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
    public ProductResponse findById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
        return Mapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        // Validate required fields
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product name is required");
        }
        if (request.getBrandId() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Brand ID is required");
        }
        if (request.getCategoryId() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Category ID is required");
        }


        // Check if product name already exists
        if (productRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT, "Product name already exists");
        }

        // Get Brand and Category
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Brand not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));

        // Create product
        Product product = Mapper.toProduct(request, brand, category);
        Product savedProduct = productRepository.save(product);

        return Mapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product ID is required");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));

        // Check name conflict
        if (request.getName() != null && !request.getName().isEmpty()) {
            if (productRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new ApplicationException(ErrorCode.CONFLICT, "Product name already exists");
            }
            product.setName(request.getName());
        }

        // Update description
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        // Update brand
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Brand not found"));
            product.setBrand(brand);
        }

        // Update category
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Category not found"));
            product.setCategory(category);
        }

        // Update warranty
        if (request.getWarrantyMonths() != null) {
            product.setWarrantyMonths(request.getWarrantyMonths());
        }

        // Update status
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        Product updatedProduct = productRepository.save(product);
        return Mapper.toProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product ID is required");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));

        productRepository.delete(product);
    }
}
