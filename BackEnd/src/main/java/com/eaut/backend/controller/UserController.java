package com.eaut.backend.controller;

import com.eaut.backend.entities.User;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.request.UserStatusUpdateRequest;
import com.eaut.backend.model.request.UserUpdateRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.RegisterReponse;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
        private final UserService userService;

        /**
         * Đăng ký user mới
         */
        @PostMapping("/register")
        public ApiResponse<User> register(@RequestBody RegisterRequest registerRequest) {
                log.info("UserController: Received register request for email: {}", registerRequest.getEmail());
                RegisterReponse registerReponse = userService.registerUser(registerRequest);
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
                UserResponse user = userService.getUserById(userId);

                ApiResponse<UserResponse> apiResponse = new ApiResponse(
                                HttpStatus.OK.value(),
                                user);

                return apiResponse;

        }

        @GetMapping("/myinfo")
        public ApiResponse<UserResponse> getMyInfo() {
                UserResponse user = userService.getMyInfo();

                ApiResponse<UserResponse> apiResponse = new ApiResponse(
                                HttpStatus.OK.value(),
                                user);
                return apiResponse;
        }

        @PreAuthorize("hasRole('admin')")
        @GetMapping
        public ResponseEntity<ApiResponse<PagingResponse<UserResponse>>> getAllUsers(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "role", required = false, defaultValue = "") String role,
                        @RequestParam(name = "permission", required = false, defaultValue = "") String permission,
                        @RequestParam(name = "status", required = false, defaultValue = "") String status,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {
                ApiResponse<PagingResponse<UserResponse>> response = userService.getAllUsers(
                                searchText,
                                sort,
                                status,
                                role,
                                permission,
                                pageNumber,
                                pageSize);
                return ResponseEntity.ok(response);
        }

        /**
         * Cập nhật thông tin user
         */
        // @PreAuthorize("hasRole('admin')")
        @PutMapping("/{userId}")
        public ApiResponse<UserResponse> updateUser(
                        @PathVariable UUID userId,
                        @RequestBody UserUpdateRequest registerRequest) {
                log.info("UserController: Update user with ID: {}", userId);
                UserResponse updatedUser = userService.updateUser(userId, registerRequest);

                ApiResponse<UserResponse> apiResponse = new ApiResponse(
                                HttpStatus.OK.value(),
                                updatedUser);

                return apiResponse;

        }

        /**
         * Cập nhật trạng thái tài khoản (khóa/mở khóa)
         * Chỉ admin mới được phép thực hiện
         */
        @PreAuthorize("hasRole('admin')")
        @PatchMapping("/{userId}/status")
        public ApiResponse<UserResponse> updateUserStatus(
                        @PathVariable UUID userId,
                        @RequestBody UserStatusUpdateRequest request) {
                log.info("UserController: Update user status - userId: {}, newStatus: {}", userId, request.getStatus());
                UserResponse updatedUser = userService.updateUserStatus(userId, request.getStatus());

                ApiResponse<UserResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                updatedUser);

                return apiResponse;
        }
}
