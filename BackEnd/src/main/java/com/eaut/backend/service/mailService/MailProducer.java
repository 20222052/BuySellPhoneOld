package com.eaut.backend.service.mailService;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class MailProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public MailProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOtpMail(String email, String otp) {
        String message = email + "|" + otp;
        kafkaTemplate.send("otp-mail-topic", message);
    }

    public void sendOtpMailForgotPassword(String email, String otp) {
        String message = email + "|" + otp;
        kafkaTemplate.send("forgot-password-topic", message);
    }

    public void sendOrderConfirmationMail(String email, String orderNumber, String customerName, String totalAmount,
            String orderItemsHTML) {
        String message = email + "|" + orderNumber + "|" + customerName + "|" + totalAmount + "|" + orderItemsHTML;
        kafkaTemplate.send("order-confirmation-topic", message);
    }

    public void sendOrderCancellationMail(String email, String orderNumber, String customerName, String reason) {
        String message = email + "|" + orderNumber + "|" + customerName + "|" + reason;
        kafkaTemplate.send("order-cancellation-topic", message);
    }
}
