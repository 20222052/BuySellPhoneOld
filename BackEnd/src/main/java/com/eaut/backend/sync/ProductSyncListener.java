package com.eaut.backend.sync;

import com.eaut.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductSyncListener {

    private final RagService ragService;

    // Lắng nghe topic khi Admin thêm/sửa sản phẩm
    @KafkaListener(topics = "product.update", groupId = "vector-sync-group")
    public void handleProductUpdate(String productItemId) {
        try {
            // Giả sử message chỉ chứa ID (UUID string)
            ragService.ingestProduct(UUID.fromString(productItemId));
        } catch (Exception e) {
            System.err.println("Lỗi đồng bộ vector: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "product.delete", groupId = "vector-sync-group")
    public void handleProductDelete(String productItemId) {
        ragService.deleteProduct(UUID.fromString(productItemId));
    }
}