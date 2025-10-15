package com.eaut.backend.Model.Request;

import com.eaut.backend.untils.Gender;
import com.eaut.backend.untils.UserRole;
import com.eaut.backend.untils.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullName;
    private Gender gender;
    
    @JsonFormat(pattern = "dd/MM/yyyy")  // Thêm annotation này
    private LocalDate birthDate;
    
    private String email;
    private String phone;
    private String password;
}
