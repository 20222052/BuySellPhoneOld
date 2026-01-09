package com.eaut.backend.model.request;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.GradeEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductModelRequest {
    UUID id; // Dùng cho update, null nếu create mới
    UUID productItemId; // Dùng khi tạo riêng lẻ
    String name;
    Integer ramGb;
    Integer romGb;
    GradeEnum grade;
    String description;

    // List colors để cascade create/update
    List<ProductColorRequest> colors;
}
