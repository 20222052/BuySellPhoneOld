package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRatingResponse {
    private UUID id;
    private UUID productId;
    private UUID userId;
    private String userName;
    private UUID orderId;
    private Integer rating;
    private String content;
    private OffsetDateTime createdAt;
}
