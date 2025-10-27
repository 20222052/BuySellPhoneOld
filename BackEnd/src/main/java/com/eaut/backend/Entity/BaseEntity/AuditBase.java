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
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy; // Người tạo


    @Column(name = "modified_at", nullable = false)
    private OffsetDateTime modifiedAt = OffsetDateTime.now(); // Thời gian sửa đổi cuối cùng


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    private User modifiedBy; // Người sửa đổi cuối cùng


    @PreUpdate
    public void touch() { this.modifiedAt = OffsetDateTime.now(); } // Cập nhật thời gian sửa đổi
}