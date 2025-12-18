package com.eaut.backend.Entity;

// === Lombok & JPA imports ===
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.constant.Gender;
import com.eaut.backend.constant.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AuditBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @Column(length = 20, unique = true)
    private String phone;

    @Column(nullable = false)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private UserStatus status = UserStatus.active;

    // Reverse relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    @ToString.Exclude
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    @ToString.Exclude
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    @ToString.Exclude
    private List<Order> orders = new ArrayList<>();
}
