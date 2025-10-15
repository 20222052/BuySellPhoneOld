package com.eaut.backend.Redis.Entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RedisHash("register_user")
public class RedisRegisterEntity<T> {
    @Id
    private String transactionId;
    private String otp;
    private long otpExpiredTime;
    private long otpResendTime;
    private int otpResendCount;
    private String email;
    private String password;
    private int otpFail;
    private T data;

    @TimeToLive
    private long ttl;
}
