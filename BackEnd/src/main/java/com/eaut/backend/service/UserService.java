package com.eaut.backend.service;

import com.eaut.backend.constant.UserStatus;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.request.UserUpdateRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.RegisterReponse;
import com.eaut.backend.model.response.UserResponse;

import java.util.UUID;

public interface UserService {
    public RegisterReponse registerUser(RegisterRequest registerRequest);

    public UserResponse getUserById(UUID userId);

    public UserResponse updateUser(UUID userId, UserUpdateRequest registerRequest);

    /**
     * Cập nhật trạng thái tài khoản (active/inactive)
     * 
     * @param userId ID của user cần cập nhật
     * @param status Trạng thái mới (active hoặc inactive)
     * @return UserResponse sau khi cập nhật
     */
    public UserResponse updateUserStatus(UUID userId, UserStatus status);

    ApiResponse<PagingResponse<UserResponse>> getAllUsers(
            String searchText,
            String sort,
            String status,
            String role,
            String permission,
            int pageNumber,
            int pageSize);

    public UserResponse getMyInfo();

}
