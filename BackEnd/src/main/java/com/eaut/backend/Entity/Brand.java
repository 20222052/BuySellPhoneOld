package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "brands")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Brand extends AuditBase {
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @Column(length = 100, nullable = false, unique = true)
    private String name;


    @Column(name = "logo_url")
    private String logoUrl;


    @OneToMany(mappedBy = "brand")
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}
