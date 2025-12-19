package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "product_colors")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductColor{
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @Column(length = 50, nullable = false, unique = true)
    private String name;


    @Column(name = "hex_code", length = 7)
    private String hexCode;
}