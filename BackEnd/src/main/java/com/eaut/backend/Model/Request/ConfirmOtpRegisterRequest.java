package com.eaut.backend.Model.Request;

import lombok.Data;

@Data
public class ConfirmOtpRegisterRequest {
    private String email;
    private String otp;
}
