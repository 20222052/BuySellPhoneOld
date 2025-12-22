package com.eaut.backend.Service.impl;

import com.eaut.backend.Entity.ProductColor;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.ProductColorRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.ProductColorResponse;
import com.eaut.backend.Model.Response.PagingResponse;
import com.eaut.backend.Repository.ProductColorRepository;
import com.eaut.backend.Service.ProductColorService;
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
        ProductColor result = Mapper.toProductColor(request);
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
        if (productColorRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT,"ProductColor name already exists");
        }
        if (productColorRepository.existsByHexCode(request.getHexCode())) {
            throw new ApplicationException(ErrorCode.CONFLICT,"ProductColor hexCode already exists");
        }
        if (request.getHexCode().length() > 6) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"ProductColor hexCode max length is 6");
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
            if (productColorRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new ApplicationException(ErrorCode.CONFLICT, "ProductColor name already exists");
            }
            productColor.setName(request.getName());
        }

        // Update hexCode nếu được cung cấp
        if (request.getHexCode() != null && !request.getHexCode().trim().isEmpty()) {
            if (productColorRepository.existsByHexCode(request.getHexCode())) {
                throw new ApplicationException(ErrorCode.CONFLICT, "ProductColor hexCode already exists");
            }
            if (request.getHexCode().length() > 6) {
                throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "ProductColor hexCode max length is 6");
            }
            productColor.setHexCode(request.getHexCode());
        }
        return productColor;
    }
}
