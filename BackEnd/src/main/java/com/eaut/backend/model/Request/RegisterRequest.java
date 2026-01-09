package com.eaut.backend.model.request;

import com.eaut.backend.constant.Gender;
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
