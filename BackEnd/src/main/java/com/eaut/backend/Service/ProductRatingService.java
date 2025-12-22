package com.eaut.backend.Service;

import java.util.UUID;

public interface ProductRatingService {
    Object CreateProductRatting(Object productRatting);
    Object getProductRattingByProductId(UUID id);
    Object deleteProductRattingByProductId(UUID id);
    Object UpdateProductRattingByProductId(UUID id, Object productRatting);
}
