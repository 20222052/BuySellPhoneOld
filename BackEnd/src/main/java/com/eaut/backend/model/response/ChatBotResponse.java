package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response được gửi từ chatbot qua WebSocket.
 * Frontend parse JSON này để render text + product cards (nếu có).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatBotResponse {

    /** Câu trả lời văn bản của AI */
    private String text;

    /** Danh sách sản phẩm gợi ý (rỗng nếu không có sản phẩm liên quan) */
    @Builder.Default
    private List<ProductSuggestion> products = List.of();

    // ──────────── Inner DTO ────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSuggestion {
        private String id; // UUID dạng String
        private String name; // Tên biến thể (VD: "iPhone 15 Pro 256GB")
        private String productName; // Tên sản phẩm gốc
        private String brandName;
        private BigDecimal sellPrice;
        private BigDecimal comparePrice;
        private String imageUrl; // Ảnh thumbnail đầu tiên
    }
}
