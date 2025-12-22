package com.eaut.backend.Model.Request;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.GradeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

 @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductModelRequest {
    private String name;
    private Integer ramGb;
    private Integer romGb;
    private GradeEnum grade;
    private String description;
}
