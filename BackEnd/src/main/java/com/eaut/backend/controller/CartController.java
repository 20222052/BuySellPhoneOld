package com.eaut.backend.controller;

import com.eaut.backend.model.request.CartRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CartResponse;
import com.eaut.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/carts")
public class CartController {

        private final CartService cartService;

        @PostMapping("/add")
        public ResponseEntity<ApiResponse<CartResponse>> addToCart(@RequestBody CartRequest request) {
                CartResponse response = cartService.addToCart(request);
                ApiResponse<CartResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Item added to cart successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<ApiResponse<java.util.List<CartResponse>>> getCartByUserId(
                        @PathVariable java.util.UUID userId) {
                java.util.List<CartResponse> response = cartService.getCartByUserId(userId);
                ApiResponse<java.util.List<CartResponse>> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Cart retrieved successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
                        @PathVariable java.util.UUID id,
                        @RequestBody com.eaut.backend.model.request.CartUpdateRequest request) {
                CartResponse response = cartService.updateCartItem(id, request);

                String message = (response == null) ? "Xóa sản phẩm khỏi giỏ hàng thành công"
                                : "Cập nhật sản phẩm trong giỏ hàng thành công";

                ApiResponse<CartResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                message,
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteCartItem(
                        @PathVariable java.util.UUID id) {
                cartService.deleteCartItem(id);
                ApiResponse<Void> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Xóa sản phẩm khỏi giỏ hàng thành công",
                                true,
                                null);
                return ResponseEntity.ok(apiResponse);
        }
}
