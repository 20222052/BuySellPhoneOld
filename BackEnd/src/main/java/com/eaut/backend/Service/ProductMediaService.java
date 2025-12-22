package com.eaut.backend.Service;

import com.eaut.backend.Entity.ProductMedia;

import java.util.List;
import java.util.UUID;

public interface ProductMediaService {
    Object uploadProductMedia(List<ProductMedia> productMedia);
    Object getProductMediaByProductId(UUID id);
    Object deleteProductMediaByProductId(UUID id);
    Object UpdateProductMediaByProductId(UUID id, Object productMedia);
}
