package com.eaut.backend.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductColorRequest {
    private UUID id; // Dùng cho update, null nếu create mới
    private String name;
    private String hexCode;
    private Integer qtyAvailable; // Số lượng có sẵn cho màu này
    private String productModelId; // Dùng khi tạo riêng lẻ
}
