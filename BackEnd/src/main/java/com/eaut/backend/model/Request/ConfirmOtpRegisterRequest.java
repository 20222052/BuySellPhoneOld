package com.eaut.backend.model.request;

import lombok.Data;

@Data
public class ConfirmOtpRegisterRequest {
    private String email;
    private String otp;
}
