package com.eaut.backend.untils;

import com.eaut.backend.Entity.User;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Repository.UserRepository;
import com.eaut.backend.constant.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;

@RequiredArgsConstructor
public class AuthDetails {
    private static UserRepository userRepository;
    public static User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "User not authenticated");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                        "User not found with email: " + authentication.getName()));
    }
}
