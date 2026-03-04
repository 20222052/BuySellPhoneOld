package com.eaut.backend.service;

import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentMethod;
import com.eaut.backend.model.request.OrderStatusUpdateRequest;
import com.eaut.backend.model.response.OrderDetailResponse;
import com.eaut.backend.model.response.OrderResponse;
import com.eaut.backend.model.response.PagingResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface OrderService {
    PagingResponse<OrderResponse> getAllOrders(String search, OrderStatus status, PaymentMethod paymentMethod,
            LocalDate fromDate, LocalDate toDate, Pageable pageable);

    OrderDetailResponse getOrderDetails(UUID orderId);

    OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request);

    OrderResponse cancelOrder(UUID orderId, com.eaut.backend.model.request.CancelOrderRequest request);
}
