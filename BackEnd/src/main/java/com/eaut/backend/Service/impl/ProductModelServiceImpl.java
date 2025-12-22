package com.eaut.backend.Service.impl;

import com.eaut.backend.Repository.ProductModelRepository;
import com.eaut.backend.Service.ProductModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductModelServiceImpl implements ProductModelService {
    final ProductModelRepository productModelRepository;
    @Override
    public Object createProductModel(Object productModel) {
        return null;
    }

    @Override
    public Object getProductModels() {
        return null;
    }

    @Override
    public Object deleteProductModelById(UUID id) {
        return null;
    }

    @Override
    public Object UpdateProductModelById(UUID id, Object productModel) {
        return null;
    }
}
