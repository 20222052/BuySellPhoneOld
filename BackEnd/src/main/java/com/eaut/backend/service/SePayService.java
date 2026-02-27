package com.eaut.backend.service;

import com.eaut.backend.model.request.SePayWebhookRequest;

public interface SePayService {
    void processWebhook(SePayWebhookRequest request);
}
