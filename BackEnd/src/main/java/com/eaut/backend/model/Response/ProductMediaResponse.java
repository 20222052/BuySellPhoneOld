package com.eaut.backend.model.response;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;


@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProductMediaResponse {
    private UUID id;
    private UUID productItemId;
    private String url;
    private String publicId;
    private String hexCode;
    private MediaType type;
    private boolean isPrimary;
    private Integer sortOrder;
}
