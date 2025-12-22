package com.eaut.backend.Entity;

import com.eaut.backend.Entity.BaseEntity.AuditBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Permission {
    @Id
    String name;
    String description;

    @Column(name = "created_at", nullable = true)
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo
}
