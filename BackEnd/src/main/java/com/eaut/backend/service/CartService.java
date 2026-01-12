package com.eaut.backend.service;

import com.eaut.backend.model.request.CartRequest;
import com.eaut.backend.model.response.CartResponse;

public interface CartService {
    CartResponse addToCart(CartRequest request);

    java.util.List<CartResponse> getCartByUserId(java.util.UUID userId);

    CartResponse updateCartItem(java.util.UUID cartItemId, com.eaut.backend.model.request.CartUpdateRequest request);

    void deleteCartItem(java.util.UUID cartItemId);
}
