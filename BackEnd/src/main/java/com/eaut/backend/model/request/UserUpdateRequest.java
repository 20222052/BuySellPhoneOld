package com.eaut.backend.model.request;

import com.eaut.backend.constant.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    private String fullName;
    private Gender gender;

    @JsonFormat(pattern = "dd/MM/yyyy") // Thêm annotation này
    private LocalDate birthDate;

    private String email;
    private String phone;
    private String password;
    private String avatarUrl;

    List<String> roles;
}
