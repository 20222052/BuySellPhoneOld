package com.eaut.backend.service.impl;

import com.eaut.backend.constant.UserStatus;
import com.eaut.backend.domain.OtpDomain;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.request.UserUpdateRequest;
import com.eaut.backend.model.response.*;
import com.eaut.backend.redis.entities.RedisRegisterEntity;
import com.eaut.backend.repository.RoleRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.mailService.MailProducer;
import com.eaut.backend.service.UserService;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.untils.BcryptUtils;
import com.eaut.backend.untils.PhoneNumberUtils;
import com.eaut.backend.untils.Validate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final OtpDomain otpDomain;
    final MailProducer mailProducer;
    @Value("${app.jwt.secret}")
    String jwtSecret;

    // đăng kí tài khoản lưu vào cache và gửi mã otp chờ xác thực
    @Override
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

    @Transactional(readOnly = true)
    @Override
    public UserResponse getUserById(UUID userId) throws ApplicationException {
        var authenticatedUser = SecurityContextHolder.getContext().getAuthentication();
        log.info("UserService: authenticatedUser: {}", authenticatedUser.getName());
        log.info("UserService: authenticatedUserRole: {}", authenticatedUser.getAuthorities());
        log.info("UserService: authenticatedDate: {}", authenticatedUser.getDetails());

        User user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId));
        // access roles to initialize while session is open
        user.getRoles().size();
        return new UserResponse(user);
    }

    @Override
    public UserResponse updateUser(UUID userId, UserUpdateRequest request) throws ApplicationException {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(
                        () -> new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not found with ID: " + userId));

        if (request == null) {
            log.info("UserService: RegisterRequest is null");
            throw new ApplicationException(ErrorCode.INVALID_REQUEST);
        }

        // Validate the register form first
        // Validate.UserServiceValidateUpdateForm(request);

        // Check if email already exists with another user
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
                throw new ApplicationException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            existingUser.setEmail(request.getEmail());
        }

        // Check if phone already exists with another user
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String phone = PhoneNumberUtils.validatePhoneNumber(request.getPhone());

            if (userRepository.existsByPhoneAndIdNot(phone, userId)) {
                throw new ApplicationException(ErrorCode.PHONE_ALREADY_EXISTS);
            }

            existingUser.setPhone(phone);
            log.info("UserService: updateUser Phone: {}", phone);
        }

        // Update existing user fields
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            existingUser.setFullName(request.getFullName());
        }
        if (request.getBirthDate() != null) {
            existingUser.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            existingUser.setGender(request.getGender());
        }
        // Only update password if it's provided (không cần mật khẩu cũ)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existingUser.setPassword(BcryptUtils.encode(request.getPassword()));
            log.info("UserService: Password updated for user: {}", userId);
        }

        // Only update roles if provided (admin feature)
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            var roles = roleRepository.findAllById(request.getRoles());
            existingUser.setRoles(new HashSet<>(roles));
        }

        User result = userRepository.save(existingUser);
        log.info("UserService: User updated successfully with email: {}", request.getEmail());
        return new UserResponse(result);
    }

    @Override
    public ApiResponse<PagingResponse<UserResponse>> getAllUsers(
            String searchText,
            String sort,
            String status,
            String role,
            String permission,
            int pageNumber,
            int pageSize) {

        // Xử lý search pattern
        String pattern = Optional.ofNullable(searchText)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> "%" + s.toLowerCase() + "%")
                .orElse(null);

        // Sort direction
        Sort.Direction direction = sort != null && sort.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(direction, "createdAt"));

        // Chuẩn hóa role + permission
        String roleName = (role != null && !role.isBlank()) ? role.trim() : null;
        String permissionName = (permission != null && !permission.isBlank()) ? permission.trim() : null;

        log.info("""
                UserService: getAllUsers
                searchPattern: {}
                role: {}
                permission: {}
                status: {}
                pageNumber: {}
                pageSize: {}
                """,
                pattern, roleName, permissionName, status, pageNumber, pageSize);

        // Gọi repository (với permission đã thêm)
        Page<User> entityPage = userRepository.getAllUsers(
                pattern,
                roleName,
                permissionName,
                status,
                pageable);

        // Map sang DTO
        List<UserResponse> dtoList = entityPage
                .stream()
                .map(UserResponse::new)
                .toList();

        PagingResponse<UserResponse> pagingResponse = new PagingResponse<>(
                dtoList,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages());

        return new ApiResponse<>(HttpStatus.OK.value(), pagingResponse);
    }

    @Transactional(readOnly = true)
    @Override
    public UserResponse getMyInfo() throws ApplicationException {
        var authenticatedUser = SecurityContextHolder.getContext().getAuthentication();
        log.info("UserService: authenticated: {}", authenticatedUser.getAuthorities());
        log.info("UserService: authenticatedUserRole: {}", authenticatedUser.getName());
        log.info("UserService: authenticatedDate: {}", authenticatedUser.getDetails());
        log.info("authenticatedUser: {}", authenticatedUser);
        User user = userRepository.findByEmail(authenticatedUser.getName())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                        "User not found with email: " + authenticatedUser.getName()));
        // access roles to initialize while session is open
        user.getRoles().size();
        return new UserResponse(user);
    }

    /**
     * Cập nhật trạng thái tài khoản (chỉ admin)
     * 
     * @param userId ID của user cần cập nhật
     * @param status Trạng thái mới (active hoặc inactive)
     * @return UserResponse sau khi cập nhật
     */
    @Transactional
    @Override
    public UserResponse updateUserStatus(UUID userId, UserStatus status) throws ApplicationException {
        log.info("UserService: updateUserStatus - userId: {}, newStatus: {}", userId, status);

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                        "User not found with ID: " + userId));

        if (status == null) {
            throw new ApplicationException(ErrorCode.INVALID_REQUEST, "Status cannot be null");
        }

        existingUser.setStatus(status);
        User updatedUser = userRepository.save(existingUser);

        log.info("UserService: User status updated successfully - userId: {}, newStatus: {}",
                userId, status);

        return new UserResponse(updatedUser);
    }
}
