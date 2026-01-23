package com.eaut.backend.service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String ORDER_TOPIC = "order-events";

    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(ORDER_TOPIC, event.getOrderId().toString(), message);
            log.info("Published OrderCreatedEvent for order: {}", event.getOrderCode());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize OrderCreatedEvent", e);
        }
    }
}
