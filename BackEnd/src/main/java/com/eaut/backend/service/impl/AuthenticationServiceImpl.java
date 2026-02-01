package com.eaut.backend.service.impl;

import com.eaut.backend.domain.OtpDomain;
import com.eaut.backend.entities.InvalidateToken;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.*;
import com.eaut.backend.model.response.AuthenticationReponse;
import com.eaut.backend.model.response.IntrospectResponse;
import com.eaut.backend.model.response.RegisterReponse;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.redis.entities.RedisRegisterEntity;
import com.eaut.backend.redis.repository.RegisterRedisRepository;
import com.eaut.backend.repository.InvalidateTokenRepository;
import com.eaut.backend.repository.RoleRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.AuthenticationService;
import com.eaut.backend.service.mailService.MailProducer;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.constant.UserRole;
import com.eaut.backend.constant.UserStatus;
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
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import static com.eaut.backend.untils.DateUtils.currentDate;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
        final UserRepository userRepository;
        final OtpDomain otpDomain;
        final RegisterRedisRepository registerRedisRepository;
        final RoleRepository roleRepository;
        final InvalidateTokenRepository invalidateTokenRepository;
        final PasswordEncoder passwordEncoder;
        final MailProducer mailProducer;
        @Value("${app.jwt.secret}")
        @NonFinal
        String jwtSecret;
        @Value("${app.google.client-id}")
        @NonFinal
        String googleClientId;

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
        public AuthenticationReponse<UserResponse> confirmOtpAndRegister(ConfirmOtpRegisterRequest request)
                        throws ApplicationException {
                AuthenticationServiceImpl.log.info(
                                "[CONFIRM-OTP] Starting OTP confirmation and user registration for Email: {}",
                                request.getEmail());

                // Validate OTP
                AuthenticationServiceImpl.log.info("[CONFIRM-OTP] Verifying OTP for Email: {}", request.getEmail());
                if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
                        AuthenticationServiceImpl.log.warn("[CONFIRM-OTP] OTP VERIFICATION FAILED for Email: {}",
                                        request.getEmail());
                        throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
                }

                AuthenticationServiceImpl.log.info(
                                "[CONFIRM-OTP] OTP verified successfully, proceeding with user creation for Email: {}",
                                request.getEmail());

                // Nhận dữ liệu đăng ký từ Redis bằng cách sử dụng email được định dạng làm khóa
                Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository
                                .findById(request.getEmail());
                if (registerEntityOpt.isEmpty()) {
                        AuthenticationServiceImpl.log.error(
                                        "[CONFIRM-OTP] REGISTRATION FAILED - Registration session not found for Email: {}",
                                        request.getEmail());
                        throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
                }

                RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
                AuthenticationServiceImpl.log.debug("[CONFIRM-OTP] Retrieved registration data for Email: {}",
                                registerEntity.getEmail());

                // Create user in database
                User user = Mapper.ToUser(registerEntity.getData());
                var role = roleRepository.findById(UserRole.customer.getValue())
                                .orElseThrow();
                user.setRoles(Set.of(role));
                // Generate JWT token
                AuthenticationServiceImpl.log.info("[CONFIRM-OTP] Generating JWT token for user - ID: {}, Email: {}",
                                user.getId(), user.getEmail());
                User result = userRepository.save(user);
                String token = otpDomain.generateToken(result);
                AuthenticationServiceImpl.log.info("[CONFIRM-OTP] User created successfully - ID: {}, Email: {}",
                                result.getId(), result.getEmail());

                // Clean up Redis data using formatted phone number as key
                registerRedisRepository.deleteById(request.getEmail());
                AuthenticationServiceImpl.log.info("[CONFIRM-OTP] Cleaned up Redis registration data for Email: {}",
                                request.getEmail());

                AuthenticationServiceImpl.log.info(
                                "[CONFIRM-OTP] REGISTRATION COMPLETED successfully for Email: {} - User ID: {}",
                                result.getEmail(),
                                result.getId());

                return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
        }

        // Forgot Password - Send OTP
        @Override
        public RegisterReponse forgotPassword(ForgotPasswordRequest fgpwRequest) throws ApplicationException {
                if (fgpwRequest.getEmail() == null && fgpwRequest.getPassword() == null) {
                        AuthenticationServiceImpl.log.info("UserService: input is null");
                        throw new ApplicationException(ErrorCode.INVALID_REQUEST);
                }

                var user = userRepository.findByEmail(fgpwRequest.getEmail())
                                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                                                "User not found with email: " + fgpwRequest.getEmail()));
                AuthenticationServiceImpl.log.info("UserService: User found with email: {}", user);
                user.setPassword(fgpwRequest.getPassword());
                Validate.validateRegisterForm(Mapper.toRegisterRequest(user));
                user.setPassword(passwordEncoder.encode(fgpwRequest.getPassword()));
                RedisRegisterEntity<RegisterRequest> registerEntity = otpDomain
                                .generateOtp(Mapper.toRegisterRequest(user));

                AuthenticationServiceImpl.log.info("UserService: Forgot Password to User OTP: {}",
                                registerEntity.getOtp());
                mailProducer.sendOtpMailForgotPassword(registerEntity.getEmail(), registerEntity.getOtp());
                return new RegisterReponse(registerEntity);
        }

        // Confirm Password - verify OTP
        @Override
        public AuthenticationReponse<UserResponse> confirmForgotPassword(ConfirmOtpRegisterRequest request)
                        throws ApplicationException {
                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: Starting OTP confirmation for password reset for Email: {}",
                                request.getEmail());

                // Validate OTP
                AuthenticationServiceImpl.log.info("AuthenticationService: Verifying OTP for Email: {}",
                                request.getEmail());
                if (!otpDomain.verifyOtpByEmail(request.getEmail(), request.getOtp())) {
                        AuthenticationServiceImpl.log.warn(
                                        "AuthenticationService: OTP VERIFICATION FAILED for Email: {}",
                                        request.getEmail());
                        throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Invalid or expired OTP");
                }

                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: OTP verified successfully, proceeding with password reset for Email: {}",
                                request.getEmail());

                // Get registration data from Redis using formatted email as key
                Optional<RedisRegisterEntity<RegisterRequest>> registerEntityOpt = registerRedisRepository
                                .findById(request.getEmail());
                if (registerEntityOpt.isEmpty()) {
                        AuthenticationServiceImpl.log.error(
                                        "AuthenticationService: REGISTRATION FAILED - Registration session not found for Email: {}",
                                        request.getEmail());
                        throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Registration session not found");
                }
                RedisRegisterEntity<RegisterRequest> registerEntity = registerEntityOpt.get();
                AuthenticationServiceImpl.log.debug("AuthenticationService: Retrieved registration data for Email: {}",
                                registerEntity.getEmail());
                var user = userRepository.findByEmail(registerEntity.getEmail())
                                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                                                "User not found with email: " + registerEntity.getEmail()));
                user.setPassword(registerEntity.getData().getPassword());
                User result = userRepository.save(user);
                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: Password reset successfully - ID: {}, Email: {}",
                                result.getId(), result.getEmail());
                // Clean up Redis data using formatted email as key
                registerRedisRepository.deleteById(request.getEmail());
                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: Cleaned up Redis registration data for Email: {}",
                                request.getEmail());
                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: PASSWORD RESET COMPLETED successfully for Email: {} - User ID: {}",
                                result.getEmail(), result.getId());
                return new AuthenticationReponse<UserResponse>(true, Mapper.toUserReponse(user));
        }

        // Login
        @Transactional(readOnly = true)
        @Override
        public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest) {
                AuthenticationServiceImpl.log.info(
                                "AuthenticationService: Attempting to authenticate user with email: {}",
                                loginRequest.getEmail());
                var user = userRepository.findByEmail(loginRequest.getEmail())
                                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                                                "User not found with email: " + loginRequest.getEmail()));

                // Kiểm tra trạng thái tài khoản - nếu bị khóa thì không cho đăng nhập
                if (user.getStatus() == UserStatus.inactive) {
                        AuthenticationServiceImpl.log.warn("AuthenticationService: Account is locked for email: {}",
                                        loginRequest.getEmail());
                        throw new ApplicationException(ErrorCode.ACCOUNT_LOCKED,
                                        "Your account has been locked. Please contact the Admin for assistance.");
                }

                var loginSuccess = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
                if (loginSuccess) {
                        String token = otpDomain.generateToken(user);
                        AuthenticationServiceImpl.log.info(
                                        "AuthenticationService: Successfully authenticated user with email: {}",
                                        loginRequest.getEmail());
                        return new AuthenticationReponse<UserResponse>(true, token, Mapper.toUserReponse(user));
                } else
                        throw new ApplicationException(ErrorCode.USER_NOT_FOUND,
                                        "Password is incorrect for email: " + loginRequest.getEmail());
        }

        @Override
        public AuthenticationReponse<UserResponse> outboundAuthenticate(ExchangeTokenRequest request) {
                log.info("AuthenticationService: Start outbound authentication with Google");
                try {
                        // Cách 1: Thử verify như ID Token (nếu client gửi ID Token)
                        try {
                                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                                                new NetHttpTransport(), new GsonFactory())
                                                .setAudience(Collections.singletonList(googleClientId))
                                                .build();

                                GoogleIdToken idToken = verifier.verify(request.getToken());
                                if (idToken != null) {
                                        GoogleIdToken.Payload payload = idToken.getPayload();
                                        return processGoogleUser(payload.getEmail(), (String) payload.get("name"),
                                                        (String) payload.get("picture"));
                                }
                        } catch (Exception e) {
                                log.warn("AuthenticationService: ID Token verification failed, trying as Access Token...");
                        }

                        // Cách 2: Verify như Access Token (gọi Google UserInfo API)
                        // https://www.googleapis.com/oauth2/v3/userinfo?access_token=...
                        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token="
                                        + request.getToken();

                        // Sử dụng RestTemplate mặc định hoặc tạo mới
                        // Ở đây dùng NetHttpTransport của google-api-client để gửi request đơn giản
                        // hoặc dùng Java HttpURLConnection

                        java.net.URL url = new java.net.URL(userInfoUrl);
                        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("GET");
                        conn.setRequestProperty("Accept", "application/json");

                        if (conn.getResponseCode() == 200) {
                                java.io.InputStreamReader reader = new java.io.InputStreamReader(conn.getInputStream());
                                com.google.gson.JsonObject json = com.google.gson.JsonParser.parseReader(reader)
                                                .getAsJsonObject();

                                String email = json.get("email").getAsString();
                                String name = json.has("name") ? json.get("name").getAsString() : "Google User";
                                String picture = json.has("picture") ? json.get("picture").getAsString() : null;

                                log.info("AuthenticationService: Access Token Verified. Email: {}", email);
                                return processGoogleUser(email, name, picture);
                        } else {
                                throw new ApplicationException(ErrorCode.UNAUTHORIZED, "Invalid Google Access Token");
                        }

                } catch (Exception e) {
                        log.error("AuthenticationService: Google Authentication Failed", e);
                        throw new ApplicationException(ErrorCode.UNAUTHORIZED,
                                        "Google Authentication Failed: " + e.getMessage());
                }
        }

        private AuthenticationReponse<UserResponse> processGoogleUser(String email, String name, String pictureUrl) {
                // Tận dụng lại logic tìm kiếm hoặc tạo mới
                Optional<User> userOptional = userRepository.findByEmail(email);
                User user;
                if (userOptional.isPresent()) {
                        user = userOptional.get();
                        log.info("AuthenticationService: User found for Google login: {}", email);

                        // Có thể cập nhật avatar nếu muốn, nhưng ở đây giữ logic đơn giản là đăng nhập
                        if (user.getStatus() == UserStatus.inactive) {
                                throw new ApplicationException(ErrorCode.ACCOUNT_LOCKED, "Account is locked");
                        }
                } else {
                        log.info("AuthenticationService: Creating new user for Google login: {}", email);
                        user = new User();
                        user.setEmail(email);
                        user.setFullName(name != null ? name : "Google User");
                        user.setAvatarUrl(pictureUrl);
                        user.setStatus(UserStatus.active);

                        // Random password
                        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

                        // Set default role
                        var role = roleRepository.findById(UserRole.customer.getValue()).orElseThrow();
                        user.setRoles(Set.of(role));

                        user = userRepository.save(user);
                }

                String token = otpDomain.generateToken(user);
                return new AuthenticationReponse<>(true, token, Mapper.toUserReponse(user));
        }

        // Logout
        @Override
        public AuthenticationReponse<UserResponse> logout() throws ApplicationException, ParseException, JOSEException {
                JwtAuthenticationToken auth = (JwtAuthenticationToken) SecurityContextHolder.getContext()
                                .getAuthentication();
                Jwt jwt = auth.getToken();

                String email = jwt.getSubject();
                String jti = jwt.getClaim("jti");
                Date exp = Date.from(jwt.getExpiresAt());

                log.info("Token info - JTI: {}, Email: {}, Expiry: {}", jti, email, exp);

                // Lấy user từ DB theo email
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                                                "User not found"));

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
