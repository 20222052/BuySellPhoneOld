package com.eaut.backend.Model.Response;

// === Lombok & JPA imports ===

import com.eaut.backend.Entity.BaseEntity.AuditBase;

import com.eaut.backend.Entity.User;
import com.eaut.backend.constant.Gender;
import com.eaut.backend.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class UserResponse extends AuditBase {
    private UUID id;
    private String fullName;
    private Gender gender;
    private LocalDate birthDate;
    private String email;
    private String phone;
    private Set<String> roles;
    private UserStatus status;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.gender = user.getGender();
        this.birthDate = user.getBirthDate();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.roles = user.getRoles();
        this.status = user.getStatus();
    }
}
