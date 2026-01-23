package com.eaut.backend.controller;

import com.eaut.backend.model.request.CheckoutRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CheckoutResponse;
import com.eaut.backend.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Process checkout - create order from cart items
     * Uses Redis distributed lock + PostgreSQL pessimistic lock for concurrency
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(@RequestBody CheckoutRequest request) {
        log.info("Checkout request received for user: {}", request.getUserId());
        CheckoutResponse response = checkoutService.checkout(request);
        ApiResponse<CheckoutResponse> apiResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Order created successfully",
                true,
                response);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<CheckoutResponse>> getOrderById(@PathVariable UUID orderId) {
        CheckoutResponse response = checkoutService.getOrderById(orderId);
        ApiResponse<CheckoutResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Order retrieved successfully",
                true,
                response);
        return ResponseEntity.ok(apiResponse);
    }

    /**
     * Get all orders for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<CheckoutResponse>>> getOrdersByUserId(@PathVariable UUID userId) {
        List<CheckoutResponse> response = checkoutService.getOrdersByUserId(userId);
        ApiResponse<List<CheckoutResponse>> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Orders retrieved successfully",
                true,
                response);
        return ResponseEntity.ok(apiResponse);
    }
}
