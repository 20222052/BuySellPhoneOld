package com.eaut.backend.model.request;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.GradeEnum;
import com.eaut.backend.entities.ProductColor;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProductModelRequest {
    UUID productItemId;
    String name;
    Integer ramGb;
    Integer romGb;
    GradeEnum grade;
    String description;
}
