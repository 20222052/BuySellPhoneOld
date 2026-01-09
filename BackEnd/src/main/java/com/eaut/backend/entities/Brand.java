package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import jakarta.persistence.*;
import lombok.*;


import java.time.OffsetDateTime;
import java.util.*;
import java.util.UUID;

@Entity
@Table(name = "brands")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Brand{
    @Id @Column(columnDefinition = "uuid")
    private UUID id;
    @PrePersist public void prePersist(){ if(id==null) id = UUID.randomUUID(); }


    @Column(length = 100, nullable = false, unique = true)
    private String name;


    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "created_at", nullable = true)
    private OffsetDateTime createdAt = OffsetDateTime.now(); // Thời gian tạo


    @OneToMany(mappedBy = "brand")
    private List<Product> products = new ArrayList<>();
}
