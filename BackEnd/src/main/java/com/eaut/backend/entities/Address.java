package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "is_warehouse", nullable = false)
    private boolean isWarehouse;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(length = 20, nullable = false)
    private String phone;

    @Column(name = "address_line", nullable = false)
    private String addressLine;

    @Column(name = "ward_name", length = 100, nullable = false)
    private String wardName;

    @Column(name = "ward_code", length = 100, nullable = false)
    private String wardCode;

    @Column(name = "district_name", length = 100)
    private String districtName;

    @Column(name = "district_code", length = 100)
    private String districtCode;

    @Column(name = "city_name", length = 100, nullable = false)
    private String cityName;

    @Column(name = "city_code", length = 100, nullable = false)
    private String cityCode;

    @Column(name = "is_delete")
    private boolean isDelete = false;
}