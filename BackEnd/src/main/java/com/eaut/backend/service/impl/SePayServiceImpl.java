package com.eaut.backend.service.impl;

import com.eaut.backend.model.request.PendingCheckoutData;
import com.eaut.backend.model.request.SePayWebhookRequest;
import com.eaut.backend.service.CheckoutService;
import com.eaut.backend.service.SePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class SePayServiceImpl implements SePayService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CheckoutService checkoutService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void processWebhook(SePayWebhookRequest request) {
        log.info("Received SePay Webhook: {}", request);

        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            log.info("Transfer type is not 'in'. Ignoring.");
            return;
        }

        String content = request.getContent();
        String orderCode = request.getCode();

        // Nếu code từ request null hoặc rỗng
        if (orderCode == null || orderCode.trim().isEmpty()) {

            if (content == null || !content.contains("-")) {
                log.warn("Content invalid. Cannot extract orderCode. Content: {}", content);
                return;
            }

            String[] parts = content.split("-");
            if (parts.length < 2 || parts[1].trim().isEmpty()) {
                log.warn("OrderCode missing in content. Content: {}", content);
                return;
            }

            orderCode = parts[1];
        }


        orderCode = orderCode.trim();
        String redisKey = "sepay:pending_order:" + orderCode;

        Object cachedData = redisTemplate.opsForValue().get(redisKey);
        if (cachedData == null) {
            log.warn("Pending order not found in Redis for code: {}", orderCode);
            return;
        }

        // Lấy lại dữ liệu đang chờ trong Redis
        if (cachedData instanceof PendingCheckoutData) {
            PendingCheckoutData pendingData = (PendingCheckoutData) cachedData;

            BigDecimal transferredAmount = request.getTransferAmount();
            // Nếu đủ tiền
            if (transferredAmount.compareTo(pendingData.getTotal()) >= 0) {
                log.info("Payment fully received for pending order: {}. Proceeding to create order in DB.", orderCode);

                try {
                    // Cập nhật Database, sinh hoá đơn thật
                    checkoutService.processRealCheckout(pendingData);

                    // Xoá bản nháp trên Redis
                    redisTemplate.delete(redisKey);

                    // Đẩy sự kiện qua WebSocket báo cho FE biết
                    messagingTemplate.convertAndSend("/topic/payment-status/" + orderCode, "PAID");
                    log.info("Websocket event sent to /topic/payment-status/{}", orderCode);
                } catch (Exception e) {
                    log.error("Failed to process real checkout for pending order: {}", orderCode, e);
                }
            } else {
                log.warn("Transferred amount {} is less than order total {} for order {}", transferredAmount,
                        pendingData.getTotal(), orderCode);
            }
        } else {
            log.error("Cached data for key {} is not of type PendingCheckoutData", redisKey);
        }
    }
}
