package com.eaut.backend.Model.Request;

// === Lombok & JPA imports ===

import com.eaut.backend.Entity.Product;
import com.eaut.backend.constant.MediaType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;


 @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductMediaRequest {
     private UUID productId;
     private String url;
     private MediaType type = MediaType.image;
    private boolean isPrimary;
    private Integer sortOrder = 0;
}
