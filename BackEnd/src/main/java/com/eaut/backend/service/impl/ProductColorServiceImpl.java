package com.eaut.backend.service.impl;

import com.eaut.backend.entities.ProductColor;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductModel;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.ProductColorRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.ProductColorResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.ProductColorRepository;
import com.eaut.backend.repository.ProductModelRepository;
import com.eaut.backend.service.ProductColorService;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductColorServiceImpl implements ProductColorService {
    final ProductColorRepository productColorRepository;
    final ProductModelRepository productModelRepository;

    @Transactional(readOnly = true)
    @Override
    public ApiResponse<PagingResponse<ProductColorResponse>> findAll(String searchText, String sort, int pageNumber, int pageSize) {
        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<ProductColor> result = productColorRepository.getAllProductColor(
                pattern,
                pageable);

        List<ProductColorResponse> productColors = result.stream()
                .map(Mapper::toProductColorResponse)
                .toList();

        PagingResponse<ProductColorResponse> response = PagingResponse.<ProductColorResponse>builder()
                .items(productColors)
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
    public ProductColorResponse findById(UUID id) {
        ProductColor productColor = productColorRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.INVALID_PARAMETER ,"ProductColor not found"));
        return Mapper.toProductColorResponse(productColor);
    }

    @Override
    public ProductColorResponse create(ProductColorRequest request) {
        validateProductColorRequestCreate(request);
        ProductModel productModel = productModelRepository.findById(UUID.fromString(request.getProductModelId()))
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,"ProductModel not found"));
        ProductColor result = Mapper.toProductColor(request);
        result.setProductModel(productModel);
        result.setCreatedAt(OffsetDateTime.now());
        ProductColor productColor = productColorRepository.save(result);
        return Mapper.toProductColorResponse(productColor);
    }

    @Override
    public ProductColorResponse update(UUID id, ProductColorRequest request) {

        ProductColor updatedProductColor = productColorRepository.save(validateProductColorRequestUpdate(request, id));
        return Mapper.toProductColorResponse(updatedProductColor);
    }

    @Override
    public void delete(UUID id) {
        if (id == null || id.toString().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor id is required");
        }
        ProductColor productColor = productColorRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,"ProductColor not found"));
        productColorRepository.delete(productColor);
    }

    private void validateProductColorRequestCreate(ProductColorRequest request) {
        if (request.getName() == null || request.getName().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor name is required");
        }
        if (request.getHexCode() == null || request.getHexCode().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor hexCode is required");
        }

        if (request.getProductModelId() == null || request.getProductModelId().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductModel id is required");
        }
        if (request.getHexCode().length() > 7) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor hexCode max length is 7");
        }
    }
    private ProductColor validateProductColorRequestUpdate(ProductColorRequest request, UUID id) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor id is required");
        }
        ProductColor productColor = productColorRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,"ProductColor not found"));
        // Update name nếu được cung cấp
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            productColor.setName(request.getName());
        }

        // Update hexCode nếu được cung cấp
        if (request.getHexCode() != null && !request.getHexCode().trim().isEmpty()) {
            if (request.getHexCode().length() > 7) {
                throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "ProductColor hexCode max length is 7");
            }
            productColor.setHexCode(request.getHexCode());
        }
        return productColor;
    }
}
