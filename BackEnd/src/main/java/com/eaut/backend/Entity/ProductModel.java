package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.untils.GradeEnum;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "product_models")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductModel extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @Column(length = 100, nullable = false)
    private String name;


    @Column(name = "ram_gb")
    private Integer ramGb;


    @Column(name = "rom_gb", nullable = false)
    private Integer romGb;


    @Enumerated(EnumType.STRING)
    @Column(length = 1)
    private GradeEnum grade; // A, B, C, D


    @Column
    private String description;
}
