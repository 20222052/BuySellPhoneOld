package com.eaut.backend.Config;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "otp")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OtpProperties {
    @Value("${otp.length}")
    int length = 6;
    @Value("${otp.expiryMinutes}")
    int expiryMinutes = 5;
    @Value("${otp.resendCooldownSeconds}")
    int resendCooldownSeconds = 60;
    @Value("${otp.resendLimit}")
    int resendLimit = 1;
    @Value("${otp.dailyLimit}")
    int dailyLimit = 5;
    @Value("${otp.maxAttempts}")
    int maxAttempts = 3;
    @Value("${otp.lockoutDurationSeconds}")
    int lockoutDurationSeconds = 900;
}
