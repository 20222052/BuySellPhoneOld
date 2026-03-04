package com.eaut.backend.untils;

import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.constant.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthDetails {
    public static User getAuthenticatedUser(UserRepository userRepository) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_FOUND, "Người dùng chưa đăng nhập");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                        "User not found with email: " + authentication.getName()));
    }
}
