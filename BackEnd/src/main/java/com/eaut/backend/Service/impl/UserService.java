package com.eaut.backend.Service.impl;

import com.eaut.backend.Domain.OtpDomain;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.*;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.MailService.MailProducer;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.PhoneNumberUtils;
import com.eaut.backend.untils.Validate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        Validate.UserServiceValidateRegisterForm(registerRequest);
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
        Validate.UserServiceValidateRegisterForm(registerRequest);

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
}
