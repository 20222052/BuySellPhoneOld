package com.eaut.backend.Service.impl;

import com.eaut.backend.Repository.ProductRatingRepository;
import com.eaut.backend.Service.ProductRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductRatingServiceImpl implements ProductRatingService {
    final ProductRatingRepository productRatingRepository;
    @Override
    public Object CreateProductRatting(Object productRatting) {
        return null;
    }

    @Override
    public Object getProductRattingByProductId(UUID id) {
        return null;
    }

    @Override
    public Object deleteProductRattingByProductId(UUID id) {
        return null;
    }

    @Override
    public Object UpdateProductRattingByProductId(UUID id, Object productRatting) {
        return null;
    }
}
