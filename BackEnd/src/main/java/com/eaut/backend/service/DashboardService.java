package com.eaut.backend.service;

import com.eaut.backend.constant.PaymentStatus;
import com.eaut.backend.dto.dashboard.DashboardOrderItemResponse;
import com.eaut.backend.dto.dashboard.DashboardOrderResponse;
import com.eaut.backend.dto.dashboard.DashboardUserResponse;
import com.eaut.backend.dto.dashboard.DashboardStatisticsResponse;
import com.eaut.backend.repository.OrderRepository;
import com.eaut.backend.repository.ProductRepository;
import com.eaut.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardService {
        private final UserRepository userRepository;
        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;

        @Transactional(readOnly = true)
        public DashboardStatisticsResponse getDashboardStatistics() {
                OffsetDateTime now = OffsetDateTime.now(); // UTC or system default depending on config, usually we want
                                                           // local
                                                           // day start/end
                // Assuming OffsetDateTime.now() captures the correct offset for "today"
                // relative to the system/business
                // For simplicity, let's align to the start and end of the current day in the
                // current offset.

                OffsetDateTime start = now.with(LocalTime.MIN);
                OffsetDateTime end = now.with(LocalTime.MAX);

                long newCustomersToday = userRepository.countByCreatedAtBetween(start, end);
                long newOrdersToday = orderRepository.countByCreatedAtBetween(start, end);
                long soldProductsToday = 0;
                Long soldProductsTodayValue = orderRepository.sumSoldProductsByCreatedAtBetween(start, end);
                if (soldProductsTodayValue != null) {
                        soldProductsToday = soldProductsTodayValue;
                }

                BigDecimal revenueToday = orderRepository.sumTotalByCreatedAtBetweenAndPaymentStatus(start, end,
                                PaymentStatus.paid);
                if (revenueToday == null) {
                        revenueToday = BigDecimal.ZERO;
                }

                var recentOrders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end).stream()
                                .map(order -> DashboardOrderResponse.builder()
                                                .id(order.getId())
                                                .code(order.getCode())
                                                .total(order.getTotal())
                                                .status(order.getStatus())
                                                .createdAt(order.getCreatedAt())
                                                .user(DashboardUserResponse.builder()
                                                                .fullName(order.getUser().getFullName())
                                                                .email(order.getUser().getEmail())
                                                                .avatarUrl(order.getUser().getAvatarUrl())
                                                                .build())
                                                .items(order.getItems().stream()
                                                                .map(item -> DashboardOrderItemResponse.builder()
                                                                                .productName(item
                                                                                                .getSnapshotProductName())
                                                                                .quantity(item.getQty())
                                                                                .price(item.getUnitPrice())
                                                                                .build())
                                                                .toList())
                                                .build())
                                .toList();

                return DashboardStatisticsResponse.builder()
                                .newCustomersToday(newCustomersToday)
                                .newOrdersToday(newOrdersToday)
                                .soldProductsToday(soldProductsToday)
                                .revenueToday(revenueToday)
                                .recentOrders(recentOrders)
                                .build();
        }
}
