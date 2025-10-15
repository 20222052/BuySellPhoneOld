package com.eaut.backend.Model.Request;

import lombok.Data;

@Data
public class ConfirmOtpForgotPasswordRequest {
    private String email;
    private String otp;
    private String password;
}
