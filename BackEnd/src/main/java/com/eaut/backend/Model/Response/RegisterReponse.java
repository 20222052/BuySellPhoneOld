package com.eaut.backend.Model.Response;

import com.eaut.backend.Entity.User;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import lombok.Data;

@Data
public class RegisterReponse {
    private String message;
    private String email;
    private long otpExpireTime;
    private long resendOptTime;

    public RegisterReponse(RedisRegisterEntity user) {
        this.message = "OTP has been sent to your mail";
        this.email = user.getEmail();
        this.otpExpireTime = user.getOtpExpiredTime() - System.currentTimeMillis()/ 1000;
        this.resendOptTime = user.getOtpResendTime() - System.currentTimeMillis()/ 1000;
    }
}
