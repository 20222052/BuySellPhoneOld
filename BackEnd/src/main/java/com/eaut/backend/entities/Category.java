package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import com.eaut.backend.entities.baseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;


@Entity
@Table(name = "categories")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @Column(length = 100, nullable = false, unique = true)
    private String name;


    @Column
    private String description;

    private String image;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

}