package com.eaut.backend.Service.impl;

import com.eaut.backend.Domain.OtpDomain;
import com.eaut.backend.Entity.InvalidateToken;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.*;
import com.eaut.backend.Model.Response.AuthenticationReponse;
import com.eaut.backend.Model.Response.IntrospectResponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.Model.Sercurity.TokenInfo;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import com.eaut.backend.Redis.Repository.RegisterRedisRepository;
import com.eaut.backend.Repository.InvalidateTokenRepository;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.AuthenticationService;
import com.eaut.backend.Service.MailService.MailProducer;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.Validate;
import com.nimbusds.jose.*;

import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static com.eaut.backend.untils.DateUtils.currentDate;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    final UserRepository userRepository;
    final OtpDomain otpDomain;
    final RegisterRedisRepository registerRedisRepository;
    final InvalidateTokenRepository invalidateTokenRepository;
    final PasswordEncoder passwordEncoder;
    final MailProducer mailProducer;
    @Value("${app.jwt.secret}")
    @NonFinal
    private String jwtSecret;


    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            otpDomain.verifyToken(token);
        } catch (ApplicationException | ParseException | JOSEException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    // Authentication OTP Confirm
    @Override
    public AuthenticationReponse<UserResponse> confirmOtpAndRegister(ConfirmOtpRegisterRequest request) throws ApplicationException {
        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] Starting OTP confirmation and user registration for Email: {}", request.getEmail());

        // Validate OTP
        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] Verifying OTP for Email: {}", request.getEmail());
        if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
            AuthenticationServiceImpl.log.warn("👤 [CONFIRM-OTP] OTP VERIFICATION FAILED for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
        }

        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] OTP verified successfully, proceeding with user creation for Email: {}", request.getEmail());

        // Nhận dữ liệu đăng ký từ Redis bằng cách sử dụng email được định dạng làm khóa
        Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository.findById(request.getEmail());
        if (registerEntityOpt.isEmpty()) {
            AuthenticationServiceImpl.log.error("👤 [CONFIRM-OTP] REGISTRATION FAILED - Registration session not found for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
        }

        RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
        AuthenticationServiceImpl.log.debug("👤 [CONFIRM-OTP] Retrieved registration data for Email: {}", registerEntity.getEmail());


        // Create user in database
        User user = Mapper.ToUser(registerEntity.getData());
        // Generate JWT token
        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] Generating JWT token for user - ID: {}, Email: {}", user.getId(), user.getEmail());
        String token = otpDomain.generateToken(user);
        User result = userRepository.save(user);
        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] User created successfully - ID: {}, Email: {}", result.getId(), result.getEmail());

        // Clean up Redis data using formatted phone number as key
        registerRedisRepository.deleteById(request.getEmail());
        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] Cleaned up Redis registration data for Email: {}", request.getEmail());

        AuthenticationServiceImpl.log.info("👤 [CONFIRM-OTP] REGISTRATION COMPLETED successfully for Email: {} - User ID: {}", result.getEmail(), result.getId());

        return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
    }

    //Forgot Password - Send OTP
    @Override
    public RegisterReponse forgotPassword(ForgotPasswordRequest fgpwRequest) throws ApplicationException {
        if (fgpwRequest.getEmail() == null && fgpwRequest.getPassword() == null) {
            AuthenticationServiceImpl.log.info("UserService: input is null");
            throw new ApplicationException(ErrorCode.INVALID_REQUEST);
        }



        var user = userRepository.findByEmail(fgpwRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + fgpwRequest.getEmail()));
        AuthenticationServiceImpl.log.info("UserService: User found with email: {}", user);
        user.setPassword(fgpwRequest.getPassword());
        Validate.validateRegisterForm(Mapper.toRegisterRequest(user));
        user.setPassword(passwordEncoder.encode(fgpwRequest.getPassword()));
        RedisRegisterEntity<RegisterRequest> registerEntity = otpDomain.generateOtp(Mapper.toRegisterRequest(user));

        AuthenticationServiceImpl.log.info("UserService: Forgot Password to User OTP: {}", registerEntity.getOtp());
        mailProducer.sendOtpMailForgotPassword(registerEntity.getEmail(), registerEntity.getOtp());
        return new RegisterReponse(registerEntity);
    }

    // Confirm Password - verify OTP
    @Override
    public AuthenticationReponse<UserResponse> confirmForgotPassword(ConfirmOtpRegisterRequest request) throws ApplicationException {
        AuthenticationServiceImpl.log.info("AuthenticationService: Starting OTP confirmation for password reset for Email: {}", request.getEmail());

        // Validate OTP
        AuthenticationServiceImpl.log.info("AuthenticationService: Verifying OTP for Email: {}", request.getEmail());
        if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
            AuthenticationServiceImpl.log.warn("AuthenticationService: OTP VERIFICATION FAILED for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
        }

        AuthenticationServiceImpl.log.info("AuthenticationService: OTP verified successfully, proceeding with password reset for Email: {}", request.getEmail());

        // Get registration data from Redis using formatted email as key
        Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository.findById(request.getEmail());
        if (registerEntityOpt.isEmpty()) {
            AuthenticationServiceImpl.log.error("AuthenticationService: REGISTRATION FAILED - Registration session not found for Email: {}", request.getEmail());
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
        }
        RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
        AuthenticationServiceImpl.log.debug("AuthenticationService: Retrieved registration data for Email: {}", registerEntity.getEmail());
        var user = userRepository.findByEmail(registerEntity.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + registerEntity.getEmail()));
        user.setPassword(registerEntity.getData().getPassword());
        User result = userRepository.save(user);
        AuthenticationServiceImpl.log.info("AuthenticationService: Password reset successfully - ID: {}, Email: {}", result.getId(), result.getEmail());
        // Clean up Redis data using formatted email as key
        registerRedisRepository.deleteById(request.getEmail());
        AuthenticationServiceImpl.log.info("AuthenticationService: Cleaned up Redis registration data for Email: {}", request.getEmail());
        AuthenticationServiceImpl.log.info("AuthenticationService: PASSWORD RESET COMPLETED successfully for Email: {} - User ID: {}", result.getEmail(), result.getId());
        return new AuthenticationReponse<UserResponse>(true, Mapper.toUserReponse(user));
    }
    // Login
    @Override
    public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest) {
        AuthenticationServiceImpl.log.info("AuthenticationService: Attempting to authenticate user with email: {}", loginRequest.getEmail());
        var user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + loginRequest.getEmail()));
        var loginSuccess = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (loginSuccess) {
            String token = otpDomain.generateToken(user);
            AuthenticationServiceImpl.log.info("AuthenticationService: Successfully authenticated user with email: {}", loginRequest.getEmail());
            return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
        }
        return new  AuthenticationReponse<UserResponse>(false);
    }
    // Logout
    @Override
    public AuthenticationReponse<UserResponse> logout() throws ApplicationException, ParseException, JOSEException {
        JwtAuthenticationToken auth =
                (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = auth.getToken();

        String email = jwt.getSubject();
        String jti = jwt.getClaim("jti");
        Date exp = Date.from(jwt.getExpiresAt());

        log.info("Token info - JTI: {}, Email: {}, Expiry: {}", jti, email, exp);

        // Lấy user từ DB theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Lưu token vào bảng blacklist
        InvalidateToken invalidateToken = new InvalidateToken();
        invalidateToken.setId(jti);
        invalidateToken.setExpiryDate(exp);
        invalidateTokenRepository.save(invalidateToken);

        log.info("User {} successfully logged out (JWT ID: {})", user.getEmail(), jti);

        return AuthenticationReponse.<UserResponse>builder()
                .logout(true)
                .build();
    }


}
