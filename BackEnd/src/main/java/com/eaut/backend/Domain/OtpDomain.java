package com.eaut.backend.Domain;

import com.eaut.backend.Config.OtpProperties;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Redis.Entities.OtpLimitEntity;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import com.eaut.backend.Redis.Repository.OtpLimitRedisRepository;
import com.eaut.backend.Redis.Repository.RegisterRedisRepository;

import com.eaut.backend.untils.BcryptUtils;
import com.eaut.backend.untils.ErrorCode;
import com.eaut.backend.untils.TimeUtils;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.util.Optional;


@Slf4j
@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OtpDomain {
    static final SecureRandom random = new SecureRandom();
    final DecimalFormat formatter;
    final OtpLimitRedisRepository otpLimitRedisRepository;
    final RegisterRedisRepository registerRedisRepository;
    final OtpProperties otpProperties;

    // Constructor để khởi tạo formatter với độ dài OTP từ properties
    public OtpDomain(OtpLimitRedisRepository otpLimitRedisRepository, 
                     RegisterRedisRepository registerRedisRepository,
                     OtpProperties otpProperties) {
        this.otpLimitRedisRepository = otpLimitRedisRepository;
        this.registerRedisRepository = registerRedisRepository;
        this.otpProperties = otpProperties;
        
        // Tạo formatter dựa trên độ dài OTP được cấu hình
        StringBuilder pattern = new StringBuilder();
        for (int i = 0; i < otpProperties.getLength(); i++) {
            pattern.append("0");
        }
        this.formatter = new DecimalFormat(pattern.toString());
    }

    //Validate OTP limit và các điều kiện theo OtpProperties
    public OtpLimitEntity validateLimitOtpByEmail(String email) {
        log.info("[validateLimitOtpByEmail] START with Email {}", email);

        // Kiểm tra OTP limit
        Optional<OtpLimitEntity> otpLimit = otpLimitRedisRepository.findById(email);

        if (otpLimit.isEmpty()) {
            OtpLimitEntity entity = new OtpLimitEntity();
            entity.setEmail(email);
            entity.setDailyOtpCounter(0);
            entity.setLastResendTime(0);
            entity.setResendCount(0);
            entity.setFailedAttempts(0);
            entity.setLockedUntil(0);

            long timeToLive = TimeUtils.getTimeToLiveEndOfDay();
            entity.setTtl(timeToLive);

            return entity;
        }

        OtpLimitEntity entity = otpLimit.get();
        long currentTimeSeconds = System.currentTimeMillis() / 1000;

        // 1. Kiểm tra lockout (tài khoản bị khóa do quá nhiều lần thử sai)
        if (entity.getLockedUntil() > currentTimeSeconds) {
            long remainingLockTime = entity.getLockedUntil() - currentTimeSeconds;
            log.warn("[validateLimitOtpByEmail] Account locked for email: {} - Remaining: {}s", 
                    email, remainingLockTime);
            throw new ApplicationException(ErrorCode.OTP_TOO_MANY_ATTEMPTS, 
                    "Account locked. Try again in " + remainingLockTime + " seconds");
        }
//
//        // 2. Kiểm tra daily limit
//        if (entity.getDailyOtpCounter() >= otpProperties.getDailyLimit()) {
//            log.warn("[validateLimitOtpByEmail] Daily limit reached for email: {} - Count: {}/{}",
//                    email, entity.getDailyOtpCounter(), otpProperties.getDailyLimit());
//            throw new ApplicationException(ErrorCode.OTP_RESEND_LIMIT_REACHED,
//                    "Daily OTP limit reached: " + otpProperties.getDailyLimit());
//        }
//
//        // 3. Kiểm tra resend limit
//        if (entity.getResendCount() >= otpProperties.getResendLimit()) {
//            log.warn("[validateLimitOtpByEmail] Resend limit reached for email: {} - Count: {}/{}",
//                    email, entity.getResendCount(), otpProperties.getResendLimit());
//            throw new ApplicationException(ErrorCode.OTP_RESEND_LIMIT_REACHED,
//                    "OTP resend limit reached: " + otpProperties.getResendLimit());
//        }

        // 4. Kiểm tra cooldown time (thời gian chờ giữa 2 lần gửi)
        if (entity.getLastResendTime() > 0) {
            long timeSinceLastResend = currentTimeSeconds - entity.getLastResendTime();
            if (timeSinceLastResend < otpProperties.getResendCooldownSeconds()) {
                long remainingCooldown = otpProperties.getResendCooldownSeconds() - timeSinceLastResend;
                log.warn("[validateLimitOtpByEmail] Cooldown active for email: {} - Remaining: {}s", 
                        email, remainingCooldown);
                throw new ApplicationException(ErrorCode.OTP_RESEND_COOLDOWN, 
                        "Must wait " + remainingCooldown + " seconds before requesting another OTP");
            }
        }

        log.info("[validateLimitOtpByEmail] DONE with Email {}", email);
        return entity;
    }

    // Sinh mã OTP với độ dài được cấu hình và lưu RegisterRequest vào cache Redis
    public RedisRegisterEntity<RegisterRequest> generateOtp(RegisterRequest registerRequest) {
        log.info("🚀 [OTP-GENERATION] Start Generating OTP by User Register: {}", registerRequest.getEmail());

        // Validate limit trước khi sinh OTP
        OtpLimitEntity otpLimitEntity = validateLimitOtpByEmail(registerRequest.getEmail());
        
        // Sinh mã OTP với độ dài được cấu hình
        String otp = genOtp();
        log.info("🔢 [OTP-GENERATION] Generated {}-digit OTP for email: {}", 
                otpProperties.getLength(), registerRequest.getEmail());
        
        long currentTimeSeconds = System.currentTimeMillis() / 1000;
        
        // Lưu OTP vào Redis với thời gian hết hạn từ properties
        RedisRegisterEntity<RegisterRequest> redisRegister =
                new RedisRegisterEntity<>(
                    registerRequest.getEmail(),
                    otp,
                    currentTimeSeconds + (otpProperties.getExpiryMinutes() * 60), // otpExpiredTime từ properties
                    currentTimeSeconds + otpProperties.getResendCooldownSeconds(),  // otpResendTime từ properties
                    otpLimitEntity.getResendCount(),
                    registerRequest.getEmail(),
                    BcryptUtils.encode(registerRequest.getPassword()),
                    0, // otpFail reset về 0
                    registerRequest,
                    otpProperties.getLockoutDurationSeconds() // TTL từ properties
            );

        log.info("💾 [REDIS-SAVE] Saving RedisRegisterEntity with ID: {} - Expires in: {} minutes", 
                registerRequest.getEmail(), otpProperties.getExpiryMinutes());
        
        RedisRegisterEntity<RegisterRequest> savedEntity = registerRedisRepository.save(redisRegister);
        log.info("✅ [REDIS-SAVE] Successfully saved RedisRegisterEntity: {}", 
                savedEntity != null ? "SUCCESS" : "FAILED");
        
        // Cập nhật OTP limit counter
        otpLimitEntity.setDailyOtpCounter(otpLimitEntity.getDailyOtpCounter() + 1);
        otpLimitEntity.setLastResendTime(currentTimeSeconds);
        otpLimitEntity.setResendCount(otpLimitEntity.getResendCount() + 1);
        
        log.info("📊 [OTP-LIMIT] Updating counters - Daily: {}/{}, Resend: {}/{}", 
                otpLimitEntity.getDailyOtpCounter(), otpProperties.getDailyLimit(),
                otpLimitEntity.getResendCount(), otpProperties.getResendLimit());
        
        otpLimitRedisRepository.save(otpLimitEntity);
        
        return redisRegister;
    }

    public boolean verifyOtpByEmail(String email, String inputOtp) {
        log.info("📱 [OTP] Starting OTP verification by email: {}", email);

        // Validate input OTP format
        if (inputOtp == null || inputOtp.length() != otpProperties.getLength()) {
            log.warn("📱 [OTP] VERIFICATION FAILED - Invalid OTP format for email: {} - Expected length: {}, Got: {}", 
                    email, otpProperties.getLength(), inputOtp != null ? inputOtp.length() : 0);
            throw new ApplicationException(ErrorCode.OTP_INVALID_FORMAT, 
                    "OTP must be " + otpProperties.getLength() + " digits");
        }

        // Check if registration session exists
        Optional<RedisRegisterEntity<RegisterRequest>> entityOpt = registerRedisRepository.findById(email);
        if (entityOpt.isEmpty()) {
            log.warn("📱 [OTP] VERIFICATION FAILED - Registration session not found for email: {}", email);
            throw new ApplicationException(ErrorCode.OTP_INVALID, "OTP session not found");
        }

        RedisRegisterEntity<RegisterRequest> entity = entityOpt.get();
        long currentTimeSeconds = System.currentTimeMillis() / 1000;

        // Check OTP expiration
        if (entity.getOtpExpiredTime() < currentTimeSeconds) {
            log.warn("📱 [OTP] VERIFICATION FAILED - OTP expired for email: {}. Current: {}, Expire: {}",
                    email, currentTimeSeconds, entity.getOtpExpiredTime());
            throw new ApplicationException(ErrorCode.OTP_EXPIRED, "OTP has expired");
        }

        // Get OTP limit entity for failed attempts tracking
        Optional<OtpLimitEntity> otpLimitOpt = otpLimitRedisRepository.findById(email);
        OtpLimitEntity otpLimitEntity = otpLimitOpt.orElse(new OtpLimitEntity());

        // Check if account is locked due to too many failed attempts
        if (otpLimitEntity.getLockedUntil() > currentTimeSeconds) {
            long remainingLockTime = otpLimitEntity.getLockedUntil() - currentTimeSeconds;
            log.warn("📱 [OTP] VERIFICATION FAILED - Account locked for email: {} - Remaining: {}s", 
                    email, remainingLockTime);
            throw new ApplicationException(ErrorCode.OTP_TOO_MANY_ATTEMPTS, 
                    "Account locked. Try again in " + remainingLockTime + " seconds");
        }

        // Check max attempts from properties
        if (entity.getOtpFail() >= otpProperties.getMaxAttempts()) {
            // Lock account for configured duration
            otpLimitEntity.setLockedUntil(currentTimeSeconds + otpProperties.getLockoutDurationSeconds());
            otpLimitEntity.setFailedAttempts(otpLimitEntity.getFailedAttempts() + 1);
            otpLimitRedisRepository.save(otpLimitEntity);
            
            log.warn("📱 [OTP] VERIFICATION FAILED - Max attempts reached ({}) for email: {} - Account locked for {}s", 
                    otpProperties.getMaxAttempts(), email, otpProperties.getLockoutDurationSeconds());
            throw new ApplicationException(ErrorCode.OTP_TOO_MANY_ATTEMPTS, 
                    "Too many failed attempts. Account locked for " + otpProperties.getLockoutDurationSeconds() + " seconds");
        }

        // Verify OTP
        if (!entity.getOtp().equals(inputOtp)) {
            entity.setOtpFail(entity.getOtpFail() + 1);
            registerRedisRepository.save(entity);
            
            // Update failed attempts in limit entity
            otpLimitEntity.setFailedAttempts(otpLimitEntity.getFailedAttempts() + 1);
            otpLimitRedisRepository.save(otpLimitEntity);
            
            log.warn("📱 [OTP] VERIFICATION FAILED - Invalid OTP for email: {} - Attempt: {}/{}",
                    email, entity.getOtpFail(), otpProperties.getMaxAttempts());
            throw new ApplicationException(ErrorCode.OTP_MISMATCH, 
                    "Invalid OTP. Remaining attempts: " + (otpProperties.getMaxAttempts() - entity.getOtpFail()));
        }

        // Reset failed attempts on successful verification
        otpLimitEntity.setFailedAttempts(0);
        otpLimitEntity.setLockedUntil(0);
        otpLimitRedisRepository.save(otpLimitEntity);

        log.info("📱 [OTP] VERIFICATION SUCCESS for email: {}", email);
        return true;
    }

    protected String genOtp() {
        // Sinh OTP với độ dài được cấu hình trong properties
        int maxValue = (int) Math.pow(10, otpProperties.getLength());
        int otp = random.nextInt(maxValue);
        return formatter.format(otp);
    }

}
