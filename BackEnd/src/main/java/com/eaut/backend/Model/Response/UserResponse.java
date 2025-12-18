package com.eaut.backend.Model.Response;

// === Lombok & JPA imports ===

import com.eaut.backend.Entity.BaseEntity.AuditBase;

import com.eaut.backend.Entity.Role;
import com.eaut.backend.Entity.User;
import lombok.Data;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class UserResponse extends AuditBase {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private Set<Role> roles;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.roles = user.getRoles();
    }
}
