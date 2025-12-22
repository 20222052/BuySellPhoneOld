package com.eaut.backend.Service;

import java.util.UUID;

public interface ProductModelService {
    Object createProductModel(Object productModel);
    Object getProductModels();
    Object deleteProductModelById(UUID id);
    Object UpdateProductModelById(UUID id, Object productModel);
}
