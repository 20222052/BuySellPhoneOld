package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Request.UserUpdateRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.PagingResponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import org.springframework.data.domain.Pageable;

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
