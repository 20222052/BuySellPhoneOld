package com.eaut.backend.controller;

import com.eaut.backend.model.request.SePayWebhookRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.service.SePayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
public class SePayWebhookController {

    private final SePayService sePayService;

    @PostMapping("/sepay")
    public ResponseEntity<ApiResponse<String>> handleSePayWebhook(@RequestBody SePayWebhookRequest request) {
        log.info("SePay Webhook Triggered. ID: {}", request.getId());

        sePayService.processWebhook(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(200)
                .message("Webhook received")
                .status(true)
                .build());
    }
}
