package com.eaut.backend.Entity.BaseEntity;


// === Lombok & JPA imports ===
import com.eaut.backend.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;


@MappedSuperclass
@Getter
@Setter
public abstract class AuditBase {
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;


    @Column(name = "modified_at", nullable = false)
    private OffsetDateTime modifiedAt = OffsetDateTime.now();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    private User modifiedBy;


    @PreUpdate
    public void touch() { this.modifiedAt = OffsetDateTime.now(); }
}