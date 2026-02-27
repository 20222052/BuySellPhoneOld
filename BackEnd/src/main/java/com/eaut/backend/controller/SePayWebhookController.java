package com.eaut.backend.controller;

import com.eaut.backend.model.request.SePayWebhookRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.service.SePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class SePayWebhookController {

    private final SePayService sePayService;

    @Value("${sepay.api-key}")
    private String sepayApiKey;

    @PostMapping("/sepay")
    public ResponseEntity<ApiResponse<String>> handleSePayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody SePayWebhookRequest request) {

        log.info("SePay Webhook Triggered. ID: {}", request.getId());

        // Validate API Key
        if (authorizationHeader == null || !authorizationHeader.equals("Apikey " + sepayApiKey)) {
            log.warn("SePay Webhook Unauthorized! Invalid API Key.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<String>builder()
                    .code(401)
                    .message("Unauthorized")
                    .status(false)
                    .build());
        }

        sePayService.processWebhook(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(200)
                .message("Webhook received")
                .status(true)
                .build());
    }
}
