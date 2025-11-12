package com.eaut.backend.untils;

import com.eaut.backend.Entity.User;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.constant.UserRole;
import com.eaut.backend.constant.UserStatus;

import java.util.Set;

import static com.eaut.backend.untils.BcryptUtils.passwordEncoder;

public class Mapper {
    public static User ToUser(RegisterRequest registerRequest){
        Set<String> roles = Set.of(String.valueOf(UserRole.customer));
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password
        user.setRoles(roles);
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
}
