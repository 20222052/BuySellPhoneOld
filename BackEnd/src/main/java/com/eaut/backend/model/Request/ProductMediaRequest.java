package com.eaut.backend.model.request;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;


 @Data
 @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductMediaRequest {
     private UUID productId;
     private String url;
     private String hexCode;
     private MediaType type = MediaType.image;
    private boolean isPrimary = false;
    private Integer sortOrder = 0;
}
