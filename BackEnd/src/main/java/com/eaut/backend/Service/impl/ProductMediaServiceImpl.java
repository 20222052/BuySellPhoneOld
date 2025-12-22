package com.eaut.backend.Service.impl;

import com.eaut.backend.Entity.ProductMedia;
import com.eaut.backend.Repository.ProductMediaRepository;
import com.eaut.backend.Service.ProductMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductMediaServiceImpl implements ProductMediaService {
    final ProductMediaRepository productMediaRepository;

    @Override
    public Object uploadProductMedia(List<ProductMedia> productMedia) {
        return null;
    }

    @Override
    public Object getProductMediaByProductId(UUID id) {
        return null;
    }

    @Override
    public Object deleteProductMediaByProductId(UUID id) {
        return null;
    }

    @Override
    public Object UpdateProductMediaByProductId(UUID id, Object productMedia) {
        return null;
    }
}
