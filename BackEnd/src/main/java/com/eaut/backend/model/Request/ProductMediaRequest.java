package com.eaut.backend.model.request;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMediaRequest {
    private UUID id; // Dùng cho update, null nếu create mới
    private UUID productId; // Dùng khi tạo riêng lẻ
    private String url; // URL ảnh (dùng khi đã upload sẵn)
    private String publicId; // Public ID từ Cloudinary
    private MediaType type = MediaType.image;
    private boolean isPrimary = false;
    private Integer sortOrder = 0;
}
