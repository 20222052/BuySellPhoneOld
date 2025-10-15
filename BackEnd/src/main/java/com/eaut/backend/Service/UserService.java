package com.eaut.backend.Service;

import com.eaut.backend.Domain.OtpDomain;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.ConfirmOtpRegisterRequest;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.*;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import com.eaut.backend.Redis.Repository.RegisterRedisRepository;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.MailService.MailProducer;
import com.eaut.backend.untils.ErrorCode;
import com.eaut.backend.untils.PhoneNumberUtils;
import com.eaut.backend.untils.UserRole;
import com.eaut.backend.untils.UserStatus;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserService {
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
    final OtpDomain otpDomain;
    final MailProducer mailProducer;
    @Value("${app.jwt.secret}")
    String jwtSecret;

    // đăng kí tài khoản lưu vào cache và gửi mã otp chờ xác thực
    public RegisterReponse registerUser(RegisterRequest registerRequest) throws ApplicationException {
        if (registerRequest == null) {
            log.info("UserService: RegisterRequest is null");
            throw new ApplicationException(ErrorCode.INVALID_REQUEST);
        }
        
        // Validate the register form first
        validateRegisterForm(registerRequest);
        registerRequest.setPhone(PhoneNumberUtils.validatePhoneNumber(registerRequest.getPhone()));
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ApplicationException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            throw new ApplicationException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        log.info("UserService: registerUser Phone: {}", registerRequest.getPhone());

        RedisRegisterEntity<RegisterRequest> registerEntity = otpDomain.generateOtp(registerRequest);

        log.info("UserService: registerUser OTP: {}", registerEntity.getOtp());
        mailProducer.sendOtpMail(registerRequest.getEmail(), registerEntity.getOtp());
        return new RegisterReponse(registerEntity);
    }

    public UserResponse getUserById(UUID userId) throws ApplicationException {
        var authenticatedUser = SecurityContextHolder.getContext().getAuthentication();
        log.info("UserService: authenticatedUser: {}", authenticatedUser.getName());
        log.info("UserService: authenticatedUserRole: {}", authenticatedUser.getAuthorities());
        log.info("UserService: authenticatedDate: {}", authenticatedUser.getDetails());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId));
        return new UserResponse(user);
    }

    public UserResponse updateUser(UUID userId, RegisterRequest registerRequest) throws ApplicationException {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId));

        if (registerRequest == null) {
            log.info("UserService: RegisterRequest is null");
            throw new ApplicationException(ErrorCode.INVALID_REQUEST);
        }

        // Validate the register form first
        validateRegisterForm(registerRequest);

        // Check if email already exists with another user
        if (userRepository.existsByEmailAndIdNot(registerRequest.getEmail(), userId)) {
            throw new ApplicationException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        
        // Check if phone already exists with another user
        if (userRepository.existsByPhoneAndIdNot(registerRequest.getPhone(), userId)) {
            throw new ApplicationException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        
        registerRequest.setPhone(PhoneNumberUtils.validatePhoneNumber(registerRequest.getPhone()));
        log.info("UserService: updateUser Phone: {}", registerRequest.getPhone());
        
        // Update existing user fields
        existingUser.setFullName(registerRequest.getFullName());
        existingUser.setGender(registerRequest.getGender());
        existingUser.setBirthDate(registerRequest.getBirthDate());
        existingUser.setEmail(registerRequest.getEmail());
        existingUser.setPhone(registerRequest.getPhone());
        
        // Only update password if it's provided
        if (registerRequest.getPassword() != null && !registerRequest.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        }
        
        User result = userRepository.save(existingUser);
        log.info("UserService: User updated successfully with email: {}", registerRequest.getEmail());
        return new UserResponse(result);
    }

    public ApiReponse<List<UserResponse>> getAllUsers() throws ApplicationException {
        List<UserResponse> userResponseList = new ArrayList<>();
        userRepository.findAll().forEach(user -> userResponseList.add(new UserResponse(user)));

        // Thêm return statement
        ApiReponse<List<UserResponse>> response = new ApiReponse<>();
        response.setData(userResponseList);
        response.setMessage("Get all users successfully");
        return response;
    }

    public UserResponse getMyInfo() throws ApplicationException {
        var authenticatedUser = SecurityContextHolder.getContext().getAuthentication();
        log.info("UserService: authenticated: {}", authenticatedUser.getAuthorities());
        log.info("UserService: authenticatedUserRole: {}", authenticatedUser.getName());
        log.info("UserService: authenticatedDate: {}", authenticatedUser.getDetails());
        User user = userRepository.findByEmail(authenticatedUser.getName())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + authenticatedUser.getName()));
        return new UserResponse(user);
    }

    public void validateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate full name
        if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Full name is required");
        }
        if (registerRequest.getFullName().trim().length() < 2) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must be at least 2 characters long");
        }
        if (registerRequest.getFullName().trim().length() > 100) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must not exceed 100 characters");
        }

        // Validate gender
        if (registerRequest.getGender() == null) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Gender is required");
        }

        // Validate birth date
        if (registerRequest.getBirthDate() == null) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date is required");
        }
        
        // Check if birth date is not in the future
        LocalDate currentDate = LocalDate.now();
        if (registerRequest.getBirthDate().isAfter(currentDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date cannot be in the future");
        }
        
        // Check minimum age (13 years old)
        LocalDate minimumBirthDate = currentDate.minusYears(13);
        if (registerRequest.getBirthDate().isAfter(minimumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "You must be at least 13 years old to register");
        }
        
        // Check maximum age (120 years old)
        LocalDate maximumBirthDate = currentDate.minusYears(120);
        if (registerRequest.getBirthDate().isBefore(maximumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Invalid birth date");
        }

        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email is required");
        }
        
        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Invalid email format");
        }

        // Validate phone number
        if (registerRequest.getPhone() == null || registerRequest.getPhone().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number is required");
        }
        
        // Vietnamese phone number validation (10-11 digits, starts with 0)
        String phoneRegex = "^0[0-9]{9,10}$";
        String cleanPhone = registerRequest.getPhone().trim().replaceAll("\\s", "");
        if (!cleanPhone.matches(phoneRegex)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number must be 10-11 digits and start with 0");
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
    public User ToUser(RegisterRequest registerRequest){
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password
        user.setRole(UserRole.customer);
        user.setStatus(UserStatus.active);
        user.setExpiresAt(OffsetDateTime.now().plusDays(1)); // Set expires_at (1 ngày)
        return user;
    }
    UserResponse toUserReponse(User user) {
        return new UserResponse(user);
    }

    String generateToken(User user) throws ApplicationException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.DAYS).toEpochMilli()
                ))
                .claim("scope", user.getRole().toString())
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
}
