package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.constant.PaymentStatus;
import com.eaut.backend.entities.*;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.CheckoutRequest;
import com.eaut.backend.model.response.AddressResponse;
import com.eaut.backend.model.response.CheckoutResponse;
import com.eaut.backend.model.response.OrderItemResponse;
import com.eaut.backend.repository.*;
import com.eaut.backend.service.CheckoutService;
import com.eaut.backend.service.DistributedLockService;
import com.eaut.backend.service.kafka.OrderCreatedEvent;
import com.eaut.backend.service.kafka.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductColorRepository productColorRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductMediaRepository productMediaRepository;
    private final DistributedLockService distributedLockService;
    private final OrderEventPublisher orderEventPublisher;

    private static final long LOCK_TIMEOUT_MS = 10000; // 10 seconds
    private static final long LOCK_DURATION_MS = 30000; // 30 seconds

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request) {
        log.info("Starting checkout for user: {}", request.getUserId());

        // 1. Validate User
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "User not found with id: " + request.getUserId()));

        // 2. Validate Address
        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), request.getUserId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Address not found with id: " + request.getAddressId()));

        // 3. Get Cart Items
        List<CartItem> cartItems = cartItemRepository.findByUserId(request.getUserId());
        if (cartItems.isEmpty()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "Cart is empty");
        }

        // 4. Create Order
        Order order = Order.builder()
                .user(user)
                .code(generateOrderCode())
                .status(OrderStatus.pending)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.unpaid)
                .subtotal(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .shippingAddress(address)
                .snapshotShippingFullName(address.getFullName())
                .snapshotShippingPhone(address.getPhone())
                .snapshotAddress(buildFullAddress(address))
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<String> lockedKeys = new ArrayList<>();

        try {
            // 5. Process each cart item with distributed lock
            for (CartItem cartItem : cartItems) {
                String lockKey = "productColor:" + cartItem.getProductColorId();

                // Acquire Redis distributed lock
                boolean lockAcquired = distributedLockService.acquireLock(lockKey, LOCK_TIMEOUT_MS, LOCK_DURATION_MS);
                if (!lockAcquired) {
                    throw new ApplicationException(ErrorCode.BAD_REQUEST,
                            "Unable to process checkout. Product is being purchased by another user. Please try again.");
                }
                lockedKeys.add(lockKey);

                // 6. Check and decrement stock with pessimistic lock
                ProductColor productColor = productColorRepository.findByIdForUpdate(cartItem.getProductColorId())
                        .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                                "Product color not found: " + cartItem.getProductColorId()));

                if (productColor.getQtyAvailable() < cartItem.getQty()) {
                    throw new ApplicationException(ErrorCode.BAD_REQUEST,
                            "Insufficient stock for product: " + productColor.getName() +
                                    ". Available: " + productColor.getQtyAvailable() +
                                    ", Requested: " + cartItem.getQty());
                }

                // Decrement stock
                int updated = productColorRepository.decrementStock(cartItem.getProductColorId(), cartItem.getQty());
                if (updated == 0) {
                    throw new ApplicationException(ErrorCode.BAD_REQUEST,
                            "Failed to reserve stock for product: " + productColor.getName());
                }

                // 7. Create Order Item
                ProductModel productModel = productColor.getProductModel();
                ProductItem productItem = productModel.getProductItem();

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .productItem(productItem)
                        .snapshotProductName(productItem.getName())
                        .snapshotProductModel(productModel.getName())
                        .snapshotProductColor(productColor.getName())
                        .snapshotProductMediaUrl(getProductImageUrl(productItem.getId()))
                        .qty(cartItem.getQty())
                        .unitPrice(cartItem.getUnitPrice())
                        .totalPrice(cartItem.getTotalPrice())
                        .createdAt(OffsetDateTime.now())
                        .build();

                order.getItems().add(orderItem);
                subtotal = subtotal.add(cartItem.getTotalPrice());
            }

            // 8. Calculate totals
            order.setSubtotal(subtotal);
            order.setTotal(subtotal.add(order.getShippingFee()));

            // 9. Save Order
            Order savedOrder = orderRepository.save(order);
            log.info("Order created successfully: {}", savedOrder.getCode());

            // 10. Clear Cart
            cartItemRepository.deleteAll(cartItems);
            log.info("Cart cleared for user: {}", request.getUserId());

            // 11. Publish Kafka Event
            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(savedOrder.getId())
                    .userId(user.getId())
                    .orderCode(savedOrder.getCode())
                    .totalAmount(savedOrder.getTotal())
                    .userEmail(user.getEmail())
                    .userName(user.getFullName())
                    .createdAt(OffsetDateTime.now())
                    .build();
            orderEventPublisher.publishOrderCreated(event);

            return mapToCheckoutResponse(savedOrder, address);

        } finally {
            // Release all locks
            for (String lockKey : lockedKeys) {
                distributedLockService.releaseLock(lockKey);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Order not found with id: " + orderId));
        return mapToCheckoutResponse(order, order.getShippingAddress());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CheckoutResponse> getOrdersByUserId(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> mapToCheckoutResponse(order, order.getShippingAddress()))
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private String generateOrderCode() {
        String timestamp = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", (int) (Math.random() * 10000));
        return "ORD" + timestamp + random;
    }

    private String buildFullAddress(Address address) {
        StringBuilder sb = new StringBuilder();
        sb.append(address.getAddressLine());
        if (address.getWardName() != null)
            sb.append(", ").append(address.getWardName());
        if (address.getDistrictName() != null)
            sb.append(", ").append(address.getDistrictName());
        if (address.getCityName() != null)
            sb.append(", ").append(address.getCityName());
        return sb.toString();
    }

    private String getProductImageUrl(UUID productItemId) {
        return productMediaRepository.findFirstImageByProductItemId(productItemId)
                .map(media -> media.getUrl())
                .orElse(null);
    }

    private CheckoutResponse mapToCheckoutResponse(Order order, Address address) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productName(item.getSnapshotProductName())
                        .modelName(item.getSnapshotProductModel())
                        .colorName(item.getSnapshotProductColor())
                        .imageUrl(item.getSnapshotProductMediaUrl())
                        .quantity(item.getQty())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        AddressResponse addressResponse = null;
        if (address != null) {
            addressResponse = AddressResponse.builder()
                    .id(address.getId())
                    .fullName(address.getFullName())
                    .phone(address.getPhone())
                    .addressLine(address.getAddressLine())
                    .wardName(address.getWardName())
                    .districtName(address.getDistrictName())
                    .cityName(address.getCityName())
                    .fullAddress(buildFullAddress(address))
                    .isDefault(address.isDefault())
                    .build();
        }

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .total(order.getTotal())
                .items(itemResponses)
                .shippingAddress(addressResponse)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
