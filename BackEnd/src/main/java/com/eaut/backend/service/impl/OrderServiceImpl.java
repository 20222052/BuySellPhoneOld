package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentMethod;
import com.eaut.backend.entities.Order;
import com.eaut.backend.entities.OrderItem;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.OrderStatusUpdateRequest;
import com.eaut.backend.model.response.OrderDetailResponse;
import com.eaut.backend.model.response.OrderItemResponse;
import com.eaut.backend.model.response.OrderResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.OrderRepository;
import com.eaut.backend.repository.ProductColorRepository;
import com.eaut.backend.repository.ProductMediaRepository;
import com.eaut.backend.service.OrderService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductColorRepository productColorRepository;
    private final ProductMediaRepository productMediaRepository;
    private final com.eaut.backend.service.mailService.MailProducer mailProducer;

    @Override
    public PagingResponse<OrderResponse> getAllOrders(String search, OrderStatus status, PaymentMethod paymentMethod,
            LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        log.info("[getAllOrders] search={}, status={}, paymentMethod={}, fromDate={}, toDate={}, page={}",
                search, status, paymentMethod, fromDate, toDate, pageable.getPageNumber());
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), searchLike),
                        cb.like(cb.lower(root.get("snapshotShippingFullName")), searchLike),
                        cb.like(cb.lower(root.get("snapshotShippingPhone")), searchLike)));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }

            if (fromDate != null) {
                OffsetDateTime from = fromDate.atStartOfDay().atOffset(ZoneOffset.UTC);
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (toDate != null) {
                OffsetDateTime to = toDate.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        log.info("[getAllOrders] totalElements={}, totalPages={}",
                orderPage.getTotalElements(), orderPage.getTotalPages());

        List<OrderResponse> items = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return PagingResponse.<OrderResponse>builder()
                .items(items)
                .page(orderPage.getNumber() + 1) // PagingResponse usually expects 1-based index or consistent with FE
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Override
    public OrderDetailResponse getOrderDetails(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.ORDER_NOT_FOUND)); // Assuming ORDER_NOT_FOUND
                                                                                         // exists or
        // generic

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        OrderDetailResponse response = new OrderDetailResponse();
        // Map fields from OrderResponse
        response.setId(order.getId());
        response.setCode(order.getCode());
        response.setUserId(order.getUser() != null ? order.getUser().getId() : null);
        response.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : null);
        response.setCustomerPhone(order.getUser() != null ? order.getUser().getPhone() : null);
        response.setCustomerName(order.getSnapshotShippingFullName());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setTotal(order.getTotal());
        response.setCreatedAt(order.getCreatedAt());

        // Map specific fields
        response.setShippingAddress(order.getSnapshotAddress());
        response.setShippingPhone(order.getSnapshotShippingPhone());
        response.setShippingFullName(order.getSnapshotShippingFullName());
        response.setItems(itemResponses);

        return response;
    }

    @Override
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(request.getStatus());
        orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(UUID orderId, com.eaut.backend.model.request.CancelOrderRequest request) {
        var authenticatedUser = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.ORDER_NOT_FOUND));

        // Ensure user can only cancel their own order or admin
        if (!order.getUser().getEmail().equals(authenticatedUser.getName()) &&
                authenticatedUser.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_admin"))) {
            throw new ApplicationException(ErrorCode.INVALID_REQUEST, "You don't have permission to cancel this order");
        }

        // Only pending orders can be cancelled by user
        if (order.getStatus() != OrderStatus.pending) {
            throw new ApplicationException(ErrorCode.INVALID_REQUEST,
                    "Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận.");
        }

        // Check refund info if payment was bank transfer
        if (order.getPaymentMethod() == PaymentMethod.bank) {
            com.eaut.backend.entities.User user = order.getUser();
            if (!org.springframework.util.StringUtils.hasText(user.getBankAccount()) ||
                    !org.springframework.util.StringUtils.hasText(user.getBankName()) ||
                    !org.springframework.util.StringUtils.hasText(user.getAccountName())) {
                throw new ApplicationException(ErrorCode.INVALID_REQUEST,
                        "Không thể hủy đơn hàng do khách hàng chưa cung cấp thông tin hoàn tiền. Vui lòng liên hệ khách hàng điền thông tin trước khi hủy.");
            }
        }

        order.setStatus(OrderStatus.cancelled);
        orderRepository.save(order);

        // Khôi phục lại số lượng sản phẩm (qtyAvailable) cho từng biến thể màu sắc
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                com.eaut.backend.entities.ProductItem pItem = item.getProductItem();
                if (pItem != null && pItem.getModels() != null) {
                    for (com.eaut.backend.entities.ProductModel model : pItem.getModels()) {
                        if (model.getName().equals(item.getSnapshotProductModel()) && model.getColors() != null) {
                            for (com.eaut.backend.entities.ProductColor color : model.getColors()) {
                                if (color.getName().equals(item.getSnapshotProductColor())) {
                                    productColorRepository.incrementStock(color.getId(), item.getQty());
                                    log.info("Restored qty {} for color {} (ID: {})", item.getQty(), color.getName(),
                                            color.getId());
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        // Publish Kafka event for Order Cancellation Email
        mailProducer.sendOrderCancellationMail(
                order.getUser().getEmail(),
                order.getCode(),
                order.getUser().getFullName() != null ? order.getUser().getFullName() : order.getUser().getEmail(),
                request != null ? request.getReason() : "");

        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getSnapshotShippingFullName())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .total(order.getTotal())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        // Dùng snapshot URL nếu có, nếu không fallback fetch ảnh hiện tại
        String imageUrl = item.getSnapshotProductMediaUrl();
        if (imageUrl == null && item.getProductItem() != null) {
            imageUrl = productMediaRepository
                    .findFirstImageByProductItemId(item.getProductItem().getId())
                    .map(media -> media.getUrl())
                    .orElse(null);
        }
        return OrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductItem().getProduct().getName())
                .productItemName(item.getSnapshotProductName())
                .modelName(item.getSnapshotProductModel())
                .colorName(item.getSnapshotProductColor())
                .imageUrl(imageUrl)
                .quantity(item.getQty())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
