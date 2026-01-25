package com.eaut.backend.controller;

import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.model.request.OrderStatusUpdateRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.OrderDetailResponse;
import com.eaut.backend.model.response.OrderResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<PagingResponse<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {
        Sort sort = order.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        PagingResponse<OrderResponse> response = orderService.getAllOrders(search, status, pageable);
        return ApiResponse.<PagingResponse<OrderResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get orders successfully")
                .data(response)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDetailResponse> getOrderDetails(@PathVariable UUID id) {
        OrderDetailResponse response = orderService.getOrderDetails(id);
        return ApiResponse.<OrderDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get order details successfully")
                .data(response)
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ApiResponse.<OrderResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Update order status successfully")
                .data(response)
                .build();
    }
}
