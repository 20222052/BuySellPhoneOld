package com.eaut.backend.service.impl;

import com.eaut.backend.entities.Brand;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.BrandRepository;
import com.eaut.backend.service.BrandService;
import com.eaut.backend.constant.ErrorCode;
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
public class BrandServiceImpl implements BrandService {
    final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    @Override
    public ApiResponse<PagingResponse<BrandResponse>> findAll(String searchText, String sort, int pageNumber, int pageSize) {
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
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"Brand name is required");
        }
        if (brandRepository.existsByName(request.getName())) {
            throw new ApplicationException(ErrorCode.CONFLICT,"Brand name already exists");
        }
        Brand brand = brandRepository.save(Mapper.toBrand(request));
        return Mapper.toBrandResponse(brand);
    }

    @Override
    public BrandResponse update(UUID id, BrandRequest request) {
        if (id == null || id.toString().isEmpty()) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"Brand id is required");
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,"Brand not found"));
        if (request.getName() != null || !request.getName().isEmpty()) {
            brand.setName(request.getName());
        }
        if (brandRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new ApplicationException(ErrorCode.CONFLICT,"Brand name already exists");
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
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,"Brand id is required");
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,"Brand not found"));
        brandRepository.delete(brand);
    }
}
