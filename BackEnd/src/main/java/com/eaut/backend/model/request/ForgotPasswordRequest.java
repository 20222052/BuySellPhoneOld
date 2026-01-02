package com.eaut.backend.model.request;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String password;
}
