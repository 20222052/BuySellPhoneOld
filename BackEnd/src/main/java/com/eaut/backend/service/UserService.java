package com.eaut.backend.service;

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
