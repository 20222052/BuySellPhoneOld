package com.eaut.backend.service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ObjectMapper objectMapper;

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

        // 2. Cập nhật statistics
        log.info("Updating order statistics for user: {}", event.getUserId());

        // TODO: Implement actual email sending and analytics
    }
}
