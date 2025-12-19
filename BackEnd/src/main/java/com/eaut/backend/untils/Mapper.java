package com.eaut.backend.untils;

import com.eaut.backend.Entity.Category;
import com.eaut.backend.Entity.User;
import com.eaut.backend.Model.Request.CategoryRequest;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.CategoryResponse;
import com.eaut.backend.Model.Response.UserResponse;

import com.eaut.backend.constant.UserStatus;

import static com.eaut.backend.untils.BcryptUtils.passwordEncoder;

public class Mapper {
    public static User ToUser(RegisterRequest registerRequest){
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password
        user.setStatus(UserStatus.active);
        return user;
    }
    public static UserResponse toUserReponse(User user) {
        return new UserResponse(user);
    }
    public static RegisterRequest toRegisterRequest(User user) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFullName(user.getFullName());
        registerRequest.setGender(user.getGender());
        registerRequest.setBirthDate(user.getBirthDate());
        registerRequest.setEmail(user.getEmail());
        registerRequest.setPhone(user.getPhone());
        registerRequest.setPassword(user.getPassword());
        return registerRequest;
    }
    public static CategoryResponse toCategoryResponse(Category category) {
        new CategoryResponse();
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .isActive(category.isActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getModifiedAt())
                .build();
    }
    public static Category toCategory(CategoryRequest request) {
        new Category();
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .image(request.getImage())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
    }
}
