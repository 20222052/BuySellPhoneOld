package com.eaut.backend.model.response;

import com.eaut.backend.constant.GradeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductModelResponse {
    UUID id;
    UUID productItemId;
    String name;
    Integer ramGb;
    Integer romGb;
    GradeEnum grade;
    String description;
    OffsetDateTime createdAt;
}
