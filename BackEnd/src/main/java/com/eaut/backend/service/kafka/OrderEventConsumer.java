package com.eaut.backend.service.kafka;

import com.eaut.backend.repository.OrderRepository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ObjectMapper objectMapper;
    private final OrderRepository orderRepository;
    private final com.eaut.backend.service.mailService.MailProducer mailProducer;

    @KafkaListener(topics = "order-events", groupId = "order-group")
    public void consumeOrderCreated(String message) {
        try {
            OrderCreatedEvent event = objectMapper.readValue(message, OrderCreatedEvent.class);
            log.info("Received OrderCreatedEvent: orderId={}, orderCode={}, total={}",
                    event.getOrderId(), event.getOrderCode(), event.getTotalAmount());

            // TODO: Xử lý thêm như gửi email, cập nhật analytics, etc.
            processOrderCreatedEvent(event);

        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize OrderCreatedEvent", e);
        }
    }

    private void processOrderCreatedEvent(OrderCreatedEvent event) {
        // 1. Gửi email xác nhận đơn hàng
        log.info("Sending confirmation email to user: {}", event.getUserEmail());

        try {
            sendConfirmationEmailTransactional(event);
        } catch (Exception e) {
            log.error("Error sending order confirmation email", e);
        }

        // 2. Cập nhật statistics
        log.info("Updating order statistics for user: {}", event.getUserId());

        // TODO: Implement actual analytics
    }

    @Transactional(readOnly = true)
    public void sendConfirmationEmailTransactional(OrderCreatedEvent event) {
        orderRepository.findByIdWithItems(event.getOrderId()).ifPresent(order -> {
            StringBuilder orderItemsHtml = new StringBuilder();
            for (com.eaut.backend.entities.OrderItem item : order.getItems()) {
                String fullProductName = item.getProductItem().getProduct().getName() + " - "
                        + item.getProductItem().getName();
                String variantInfo = item.getSnapshotProductColor() != null ? item.getSnapshotProductColor() : "";
                if (item.getSnapshotProductModel() != null && !item.getSnapshotProductModel().isEmpty()) {
                    variantInfo += (variantInfo.isEmpty() ? "" : ", ") + item.getSnapshotProductModel();
                }

                String formattedPrice = String.format("%,.0f đ", item.getUnitPrice());
                String formattedTotal = String.format("%,.0f đ", item.getTotalPrice());

                orderItemsHtml.append("<div style='border-bottom: 1px solid #eee; padding: 10px 0;'>")
                        .append("<p style='margin: 0; font-weight: bold; color: #333;'>").append(fullProductName)
                        .append("</p>")
                        .append("<p style='margin: 5px 0; font-size: 14px; color: #666;'>Phân loại: ")
                        .append(variantInfo).append("</p>")
                        .append("<div style='display: flex; justify-content: space-between; font-size: 14px;'>")
                        .append("<span style='color: #666;'>").append(item.getQty()).append(" x ")
                        .append(formattedPrice).append("</span>")
                        .append("<span style='font-weight: bold; color: #28a745;'>").append(formattedTotal)
                        .append("</span>")
                        .append("</div>")
                        .append("</div>");
            }

            String totalAmountFormatted = String.format("%,.0f đ", event.getTotalAmount());
            mailProducer.sendOrderConfirmationMail(
                    event.getUserEmail(),
                    event.getOrderCode(),
                    event.getUserName(),
                    totalAmountFormatted,
                    orderItemsHtml.toString());
        });
    }
}
