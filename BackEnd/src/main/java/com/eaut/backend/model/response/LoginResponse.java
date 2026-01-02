package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String phoneNumber;
    private String status;
    
    public LoginResponse(String accessToken, Long userId, String phoneNumber, String status) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.status = status;
    }
}
