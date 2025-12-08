package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    public RegisterReponse registerUser(RegisterRequest registerRequest);
    public UserResponse getUserById(UUID userId);
    public UserResponse updateUser(UUID userId, RegisterRequest registerRequest);
    public ApiResponse<List<UserResponse>> getAllUsers();
    public UserResponse getMyInfo();
}
