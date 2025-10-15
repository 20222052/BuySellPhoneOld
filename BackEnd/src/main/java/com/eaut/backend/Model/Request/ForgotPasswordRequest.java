package com.eaut.backend.Model.Request;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String password;
}
