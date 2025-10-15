package com.eaut.backend.Model.Response;

// === Lombok & JPA imports ===

import com.eaut.backend.Entity.Address;
import com.eaut.backend.Entity.BaseEntity.AuditBase;
import com.eaut.backend.Entity.Cart;
import com.eaut.backend.Entity.Order;
import com.eaut.backend.Entity.User;
import com.eaut.backend.untils.Gender;
import com.eaut.backend.untils.UserRole;
import com.eaut.backend.untils.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class UserResponse extends AuditBase {
    private UUID id;
    private String fullName;
    private Gender gender;
    private LocalDate birthDate;
    private String email;
    private String phone;
    private UserRole role;
    private UserStatus status;
    private String accessToken;
    private String refreshToken;
    private OffsetDateTime expiresAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.gender = user.getGender();
        this.birthDate = user.getBirthDate();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.accessToken = user.getAccessToken();
        this.refreshToken = user.getRefreshToken();
        this.expiresAt = user.getExpiresAt();
    }
}
