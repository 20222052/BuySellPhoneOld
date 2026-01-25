package com.eaut.backend.model.response;

// === Lombok & JPA imports ===

import com.eaut.backend.constant.UserStatus;
import com.eaut.backend.entities.baseEntity.AuditBase;

import com.eaut.backend.entities.Role;
import com.eaut.backend.entities.User;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Set;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserResponse extends AuditBase {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private UserStatus status;
    private String avatarUrl;
    private Set<Role> roles;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.status = user.getStatus();
        this.avatarUrl = user.getAvatarUrl();
        this.roles = user.getRoles();
    }
}
