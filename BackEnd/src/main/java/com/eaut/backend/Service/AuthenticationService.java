package com.eaut.backend.Service;

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
import com.eaut.backend.untils.*;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
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
        User user = ToUser(registerEntity.getData());
        // Generate JWT token
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Generating JWT token for user - ID: {}, Email: {}", user.getId(), user.getEmail());
        String token = generateToken(user);
        User result = userRepository.save(user);
        AuthenticationService.log.info("👤 [CONFIRM-OTP] User created successfully - ID: {}, Email: {}", result.getId(), result.getEmail());

        // Clean up Redis data using formatted phone number as key
        registerRedisRepository.deleteById(request.getEmail());
        AuthenticationService.log.info("👤 [CONFIRM-OTP] Cleaned up Redis registration data for Email: {}", request.getEmail());

        AuthenticationService.log.info("👤 [CONFIRM-OTP] REGISTRATION COMPLETED successfully for Email: {} - User ID: {}", result.getEmail(), result.getId());

        return new AuthenticationReponse<UserResponse>(true, toUserReponse(user));
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
        validateRegisterForm(toRegisterRequest(user));
        user.setPassword(passwordEncoder.encode(fgpwRequest.getPassword()));
        RedisRegisterEntity<RegisterRequest> registerEntity = otpDomain.generateOtp(toRegisterRequest(user));

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
        return new AuthenticationReponse<UserResponse>(true, toUserReponse(user));
    }
    // Login
    public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest) {
        AuthenticationService.log.info("AuthenticationService: Attempting to authenticate user with email: {}", loginRequest.getEmail());
        var user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + loginRequest.getEmail()));
        var loginSuccess = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (loginSuccess) {
            AuthenticationService.log.info("AuthenticationService: Successfully authenticated user with email: {}", loginRequest.getEmail());
            return new AuthenticationReponse<UserResponse>(true, toUserReponse(user));
        }
        return new  AuthenticationReponse<UserResponse>(false);
    }
    // Logout
    public AuthenticationReponse<UserResponse> logout(LogoutRequest logoutRequest) throws ApplicationException, ParseException, JOSEException {
        TokenInfo tokenInfo = getTokenInfo(logoutRequest.getToken());

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

    private SignedJWT verifyToken(String token) throws ApplicationException, ParseException, JOSEException {
            JWSVerifier verifier = new MACVerifier(jwtSecret.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date exprirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            var verify = signedJWT.verify(verifier);
            if (exprirationTime.before(new Date())) {
                throw new ApplicationException(ErrorCode.TOKEN_EXPIRED, "Token is invalid");
            }else if (!verify){
                throw new ApplicationException(ErrorCode.TOKEN_INVALID, "Token is invalid");
            }
            return signedJWT;
    }

    private TokenInfo getTokenInfo(String token) throws ApplicationException, ParseException, JOSEException {
        SignedJWT signedJWT = verifyToken(token);
        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

        return new TokenInfo(
                UUID.fromString(claims.getJWTID()),
                claims.getSubject(),
                claims.getIssueTime().getTime(),
                claims.getExpirationTime().getTime(),
                claims.getStringClaim("scope")
        );
    }

    User ToUser(RegisterRequest registerRequest){
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password
//        user.setRoles();
        user.setStatus(UserStatus.active);
        return user;
    }
    UserResponse toUserReponse(User user) {
        return new UserResponse(user);
    }
    RegisterRequest toRegisterRequest(User user) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFullName(user.getFullName());
        registerRequest.setGender(user.getGender());
        registerRequest.setBirthDate(user.getBirthDate());
        registerRequest.setEmail(user.getEmail());
        registerRequest.setPhone(user.getPhone());
        registerRequest.setPassword(user.getPassword());
        return registerRequest;
    }
    String generateToken(User user) throws ApplicationException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.DAYS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", user.getRoles().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(jwtSecret.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new ApplicationException(ErrorCode.UNABLE_TOKEN_CREATED, e.getMessage());
        }
    }
    void validateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email is required");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Invalid email format");
        }

        // Validate password
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password is required");
        }

        if (registerRequest.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must be at least 6 characters long");
        }

        if (registerRequest.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must not exceed 128 characters");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!registerRequest.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK, "Password must contain at least one letter and one number");
        }
    }
}
