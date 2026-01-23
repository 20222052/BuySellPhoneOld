package com.eaut.backend.service;

import com.eaut.backend.model.request.CheckoutRequest;
import com.eaut.backend.model.response.CheckoutResponse;

import java.util.List;
import java.util.UUID;

public interface CheckoutService {

    /**
     * Process checkout from user's cart
     * Creates an order with all cart items
     * Uses Redis distributed lock and PostgreSQL pessimistic lock for concurrency
     * control
     * 
     * @param request CheckoutRequest containing userId, addressId, paymentMethod
     * @return CheckoutResponse with order details
     */
    CheckoutResponse checkout(CheckoutRequest request);

    /**
     * Get order details by order ID
     */
    CheckoutResponse getOrderById(UUID orderId);

    /**
     * Get all orders for a user
     */
    List<CheckoutResponse> getOrdersByUserId(UUID userId);
}
