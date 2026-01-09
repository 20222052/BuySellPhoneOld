package com.eaut.backend.model.request;

import lombok.Data;

@Data
public class ConfirmOtpForgotPasswordRequest {
    private String email;
    private String otp;
    private String password;
}
