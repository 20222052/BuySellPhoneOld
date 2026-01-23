package com.eaut.backend.model.response;

import com.eaut.backend.entities.baseEntity.AuditBase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogResponse extends AuditBase {
    private UUID id;
    private String title;
    private String content;
    private String imageUrl;
    private String author;
    private Long viewCount;
}
