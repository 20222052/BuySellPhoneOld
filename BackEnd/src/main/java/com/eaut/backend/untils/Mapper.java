package com.eaut.backend.untils;

import com.eaut.backend.entities.*;
import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.request.CategoryRequest;
import com.eaut.backend.model.request.ProductColorRequest;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.CategoryResponse;
import com.eaut.backend.model.response.ProductColorResponse;
import com.eaut.backend.model.response.UserResponse;

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

    public static BrandResponse toBrandResponse(Brand brand){
        new BrandResponse();
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .logoUrl(brand.getLogoUrl())
                .build();
    }

    public static Brand toBrand(BrandRequest request) {
        new Brand();
        return Brand.builder()
                .name(request.getName())
                .logoUrl(request.getLogoUrl())
                .build();
    }

    public static ProductColorResponse toProductColorResponse(ProductColor productColor) {
        new ProductColorResponse();
        return  ProductColorResponse.builder()
                .id(productColor.getId())
                .name(productColor.getName())
                .hexCode(productColor.getHexCode())
                .build();
    }

    public static ProductColor toProductColor(ProductColorRequest request) {
        new ProductColor();
        return ProductColor.builder()
                .name(request.getName())
                .hexCode(request.getHexCode())
                .build();
    }
}
