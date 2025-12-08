package com.eaut.backend.API;

import com.eaut.backend.Entity.User;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.Service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.http.HttpStatus;
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
    private final UserServiceImpl userServiceImpl;

    /**
     * Đăng ký user mới
     */
    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody RegisterRequest registerRequest) {
        log.info("UserController: Received register request for email: {}", registerRequest.getEmail());
        RegisterReponse registerReponse = userServiceImpl.registerUser(registerRequest);
        ApiResponse<User> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                registerReponse);
        return apiResponse;
    }


    /**
     * Lấy thông tin user theo ID
     */
    @PostAuthorize("returnObject.data.email == authentication.name or hasRole('admin')")
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID userId) {
            log.info("UserController: Get user by ID: {}", userId);
            UserResponse user = userServiceImpl.getUserById(userId);

            ApiResponse<UserResponse> apiResponse = new ApiResponse(
                    HttpStatus.OK.value(),
                    user);

        return apiResponse;

    }

    @GetMapping("/myinfo")
    public ApiResponse<UserResponse> getMyInfo() {
            UserResponse user = userServiceImpl.getMyInfo();

            ApiResponse<UserResponse> apiResponse = new ApiResponse(
                    HttpStatus.OK.value(),
                    user);
        return apiResponse;
    }

    /**
     * Cập nhật thông tin user
     */
    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{userId}")
    public ApiResponse<UserResponse> updateUser(
            @PathVariable UUID userId, 
            @RequestBody RegisterRequest registerRequest) {
            log.info("UserController: Update user with ID: {}", userId);
            UserResponse updatedUser = userServiceImpl.updateUser(userId, registerRequest);

        ApiResponse<UserResponse> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                updatedUser);

        return apiResponse;

    }
}
