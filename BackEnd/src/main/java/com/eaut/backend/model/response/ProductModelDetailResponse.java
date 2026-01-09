package com.eaut.backend.model.response;

import com.eaut.backend.constant.GradeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductModelDetailResponse {
    private UUID id;
    private UUID productItemId;
    private String name;
    private Integer ramGb;
    private Integer romGb;
    private GradeEnum grade;
    private String description;
    private List<ProductColorResponse> colors;
    private OffsetDateTime createdAt;
}
