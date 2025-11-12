package com.eaut.backend.Service.impl;

import com.eaut.backend.Domain.OtpDomain;
import com.eaut.backend.Entity.InvalidateToken;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.*;
import com.eaut.backend.Model.Response.AuthenticationReponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.Model.Sercurity.TokenInfo;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import com.eaut.backend.Redis.Repository.RegisterRedisRepository;
import com.eaut.backend.Repository.InvalidateTokenRepository;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.MailService.MailProducer;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.Validate;
import com.nimbusds.jose.*;
import com.nimbusds.jwt.JWTClaimsSet;

import com.nimbusds.jwt.SignedJWT;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    final UserRepository userRepository;
    final OtpDomain otpDomain;
    final RegisterRedisRepository registerRedisRepository;
    final InvalidateTokenRepository invalidateTokenRepository;
    final PasswordEncoder passwordEncoder;
    final MailProducer mailProducer;
    @Value("${app.jwt.secret}")
    @NonFinal
    private String jwtSecret;

    // Authentication OTP Confirm
    public AuthenticationReponse<UserResponse> confirmOtpAndRegister(ConfirmOtpRegisterRequest request) throws ApplicationException {
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Starting OTP confirmation and user registration for Email: {}", request.getEmail());

        // Validate OTP
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Verifying OTP for Email: {}", request.getEmail());
        if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
            AuthenticationService.log.warn("👤 [CONFIRM-OTP] OTP VERIFICATION FAILED for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
        }

        AuthenticationService.log.info("👤 [CONFIRM-OTP] OTP verified successfully, proceeding with user creation for Email: {}", request.getEmail());

        // Nhận dữ liệu đăng ký từ Redis bằng cách sử dụng email được định dạng làm khóa
        Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository.findById(request.getEmail());
        if (registerEntityOpt.isEmpty()) {
            AuthenticationService.log.error("👤 [CONFIRM-OTP] REGISTRATION FAILED - Registration session not found for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
        }

        RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
        AuthenticationService.log.debug("👤 [CONFIRM-OTP] Retrieved registration data for Email: {}", registerEntity.getEmail());


        // Create user in database
        User user = Mapper.ToUser(registerEntity.getData());
        // Generate JWT token
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Generating JWT token for user - ID: {}, Email: {}", user.getId(), user.getEmail());
        String token = otpDomain.generateToken(user);
        User result = userRepository.save(user);
        AuthenticationService.log.info("👤 [CONFIRM-OTP] User created successfully - ID: {}, Email: {}", result.getId(), result.getEmail());

        // Clean up Redis data using formatted phone number as key
        registerRedisRepository.deleteById(request.getEmail());
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Cleaned up Redis registration data for Email: {}", request.getEmail());

        AuthenticationService.log.info("👤 [CONFIRM-OTP] REGISTRATION COMPLETED successfully for Email: {} - User ID: {}", result.getEmail(), result.getId());

        return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
    }

    //Forgot Password - Send OTP
    public RegisterReponse forgotPassword(ForgotPasswordRequest fgpwRequest) throws ApplicationException {
        if (fgpwRequest.getEmail() == null && fgpwRequest.getPassword() == null) {
            AuthenticationService.log.info("UserService: input is null");
            throw new ApplicationException(ErrorCode.INVALID_REQUEST);
        }



        var user = userRepository.findByEmail(fgpwRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + fgpwRequest.getEmail()));
        AuthenticationService.log.info("UserService: User found with email: {}", user);
        user.setPassword(fgpwRequest.getPassword());
        Validate.validateRegisterForm(Mapper.toRegisterRequest(user));
        user.setPassword(passwordEncoder.encode(fgpwRequest.getPassword()));
        RedisRegisterEntity<RegisterRequest> registerEntity = otpDomain.generateOtp(Mapper.toRegisterRequest(user));

        AuthenticationService.log.info("UserService: Forgot Password to User OTP: {}", registerEntity.getOtp());
        mailProducer.sendOtpMailForgotPassword(registerEntity.getEmail(), registerEntity.getOtp());
        return new RegisterReponse(registerEntity);
    }

    // Confirm Password - verify OTP
    public AuthenticationReponse<UserResponse> confirmForgotPassword(ConfirmOtpRegisterRequest request) throws ApplicationException {
        AuthenticationService.log.info("AuthenticationService: Starting OTP confirmation for password reset for Email: {}", request.getEmail());

        // Validate OTP
        AuthenticationService.log.info("AuthenticationService: Verifying OTP for Email: {}", request.getEmail());
        if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
            AuthenticationService.log.warn("AuthenticationService: OTP VERIFICATION FAILED for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
        }

        AuthenticationService.log.info("AuthenticationService: OTP verified successfully, proceeding with password reset for Email: {}", request.getEmail());

        // Get registration data from Redis using formatted email as key
        Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository.findById(request.getEmail());
        if (registerEntityOpt.isEmpty()) {
            AuthenticationService.log.error("AuthenticationService: REGISTRATION FAILED - Registration session not found for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
        }
        RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
        AuthenticationService.log.debug("AuthenticationService: Retrieved registration data for Email: {}", registerEntity.getEmail());
        var user = userRepository.findByEmail(registerEntity.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + registerEntity.getEmail()));
        user.setPassword(registerEntity.getData().getPassword());
        User result = userRepository.save(user);
        AuthenticationService.log.info("AuthenticationService: Password reset successfully - ID: {}, Email: {}", result.getId(), result.getEmail());
        // Clean up Redis data using formatted email as key
        registerRedisRepository.deleteById(request.getEmail());
        AuthenticationService.log.info("AuthenticationService: Cleaned up Redis registration data for Email: {}", request.getEmail());
        AuthenticationService.log.info("AuthenticationService: PASSWORD RESET COMPLETED successfully for Email: {} - User ID: {}", result.getEmail(), result.getId());
        return new AuthenticationReponse<UserResponse>(true, Mapper.toUserReponse(user));
    }
    // Login
    public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest) {
        AuthenticationService.log.info("AuthenticationService: Attempting to authenticate user with email: {}", loginRequest.getEmail());
        var user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + loginRequest.getEmail()));
        var loginSuccess = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (loginSuccess) {
            String token = otpDomain.generateToken(user);
            AuthenticationService.log.info("AuthenticationService: Successfully authenticated user with email: {}", loginRequest.getEmail());
            return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
        }
        return new  AuthenticationReponse<UserResponse>(false);
    }
    // Logout
    public AuthenticationReponse<UserResponse> logout(LogoutRequest logoutRequest) throws ApplicationException, ParseException, JOSEException {
        TokenInfo tokenInfo = otpDomain.getTokenInfo(logoutRequest.getToken());

        // Use logger instead of static log(...)
        AuthenticationService.log.info("Token info: {}", tokenInfo);

        // Lấy user từ DB theo email
        User user = userRepository.findByEmail(tokenInfo.getSubject())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Lưu token vào bảng blacklist (để ngăn token còn hạn bị tái sử dụng)
        // Use Date constructed from epoch millis
        invalidateTokenRepository.save(new InvalidateToken(tokenInfo.getJwtId().toString(), new Date(tokenInfo.getExpiration())));

        AuthenticationService.log.info("User {} successfully logged out (JWT ID: {})", user.getEmail(), tokenInfo.getJwtId());

        return AuthenticationReponse.<UserResponse>builder()
                .logout(true)
                .build();
    }
}
