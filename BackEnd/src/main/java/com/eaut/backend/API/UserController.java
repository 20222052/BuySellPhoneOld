package com.eaut.backend.API;

import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.ConfirmOtpRegisterRequest;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.ApiReponse;
import com.eaut.backend.Model.Response.AuthenticationReponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.http.HttpRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    /**
     * Đăng ký user mới
     */
    @PostMapping("/register")
    public ApiReponse<User> register(@RequestBody RegisterRequest registerRequest) {
        log.info("UserController: Received register request for email: {}", registerRequest.getEmail());
        RegisterReponse registerReponse = userService.registerUser(registerRequest);
        ApiReponse<User> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                registerReponse);
        return apiReponse;
    }


    /**
     * Lấy thông tin user theo ID
     */
    @PostAuthorize("returnObject.data.email == authentication.name or hasRole('admin')")
    @GetMapping("/{userId}")
    public ApiReponse<UserResponse> getUserById(@PathVariable UUID userId) {
            log.info("UserController: Get user by ID: {}", userId);
            UserResponse user = userService.getUserById(userId);

            ApiReponse<UserResponse> apiReponse = new ApiReponse(
                    HttpStatus.OK.value(),
                    user);

        return apiReponse;

    }

    @GetMapping("/myinfo")
    public ApiReponse<UserResponse> getMyInfo() {
            UserResponse user = userService.getMyInfo();

            ApiReponse<UserResponse> apiReponse = new ApiReponse(
                    HttpStatus.OK.value(),
                    user);
        return apiReponse;
    }

    /**
     * Cập nhật thông tin user
     */
    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{userId}")
    public ApiReponse<UserResponse> updateUser(
            @PathVariable UUID userId, 
            @RequestBody RegisterRequest registerRequest) {
            log.info("UserController: Update user with ID: {}", userId);
            UserResponse updatedUser = userService.updateUser(userId, registerRequest);

        ApiReponse<UserResponse> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                updatedUser);

        return apiReponse;

    }
}
