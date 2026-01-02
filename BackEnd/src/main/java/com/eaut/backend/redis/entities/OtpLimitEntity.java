package com.eaut.backend.redis.entities;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@RedisHash("otp")
@Data
public class OtpLimitEntity {
    @Id
    private String email;
    private int dailyOtpCounter;
    private long lastResendTime;      // Thời gian gửi OTP lần cuối
    private int resendCount;          // Số lần gửi lại trong phiên
    private int failedAttempts;       // Số lần nhập sai OTP
    private long lockedUntil;         // Thời gian khóa tài khoản (timestamp)
    private boolean otpLimitStatus; // Trạng thái giới hạn OTP
    @TimeToLive
    private long ttl;
}

