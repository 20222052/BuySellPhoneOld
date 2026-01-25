package com.eaut.backend.service;

import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.model.request.OrderStatusUpdateRequest;
import com.eaut.backend.model.response.OrderDetailResponse;
import com.eaut.backend.model.response.OrderResponse;
import com.eaut.backend.model.response.PagingResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {
    PagingResponse<OrderResponse> getAllOrders(String search, OrderStatus status, Pageable pageable);

    OrderDetailResponse getOrderDetails(UUID orderId);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request);
}
