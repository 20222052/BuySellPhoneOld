package com.eaut.backend.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RagService {
    void ingestProduct(UUID productItemId);

    void deleteProduct(UUID productItemId);

    List<Map<String, Object>> searchProducts(String userQuery);
}
