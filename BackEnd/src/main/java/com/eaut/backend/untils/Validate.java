package com.eaut.backend.untils;

import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Model.Request.UserUpdateRequest;
import com.eaut.backend.constant.ErrorCode;

import java.time.LocalDate;

public class Validate {
    public static void validateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email is required");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Invalid email format");
        }

        // Validate password
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password is required");
        }

        if (registerRequest.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must be at least 6 characters long");
        }

        if (registerRequest.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must not exceed 128 characters");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!registerRequest.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK, "Password must contain at least one letter and one number");
        }
    }

    public static void UserServiceValidateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate full name
        if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Full name is required");
        }
        if (registerRequest.getFullName().trim().length() < 2) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must be at least 2 characters long");
        }
        if (registerRequest.getFullName().trim().length() > 100) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must not exceed 100 characters");
        }

        // Validate gender
        if (registerRequest.getGender() == null) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Gender is required");
        }

        // Validate birth date
        if (registerRequest.getBirthDate() == null) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date is required");
        }

        // Check if birth date is not in the future
        LocalDate currentDate = LocalDate.now();
        if (registerRequest.getBirthDate().isAfter(currentDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date cannot be in the future");
        }

        // Check minimum age (13 years old)
        LocalDate minimumBirthDate = currentDate.minusYears(13);
        if (registerRequest.getBirthDate().isAfter(minimumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "You must be at least 13 years old to register");
        }

        // Check maximum age (120 years old)
        LocalDate maximumBirthDate = currentDate.minusYears(120);
        if (registerRequest.getBirthDate().isBefore(maximumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Invalid birth date");
        }

        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email is required");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Invalid email format");
        }

        // Validate phone number
        if (registerRequest.getPhone() == null || registerRequest.getPhone().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number is required");
        }

        // Vietnamese phone number validation (10-11 digits, starts with 0)
        String phoneRegex = "^0[0-9]{9,10}$";
        String cleanPhone = registerRequest.getPhone().trim().replaceAll("\\s", "");
        if (!cleanPhone.matches(phoneRegex)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number must be 10-11 digits and start with 0");
        }

        // Validate password
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password is required");
        }

        if (registerRequest.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must be at least 6 characters long");
        }

        if (registerRequest.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must not exceed 128 characters");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!registerRequest.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK, "Password must contain at least one letter and one number");
        }
    }

    public static void UserServiceValidateUpdateForm(UserUpdateRequest request) throws ApplicationException {
        // Validate full name
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Full name is required");
        }
        if (request.getFullName().trim().length() < 2) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must be at least 2 characters long");
        }
        if (request.getFullName().trim().length() > 100) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Full name must not exceed 100 characters");
        }

        // Validate gender
        if (request.getGender() == null) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Gender is required");
        }

        // Validate birth date
        if (request.getBirthDate() == null) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date is required");
        }

        // Check if birth date is not in the future
        LocalDate currentDate = LocalDate.now();
        if (request.getBirthDate().isAfter(currentDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Birth date cannot be in the future");
        }

        // Check minimum age (13 years old)
        LocalDate minimumBirthDate = currentDate.minusYears(13);
        if (request.getBirthDate().isAfter(minimumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "You must be at least 13 years old to register");
        }

        // Check maximum age (120 years old)
        LocalDate maximumBirthDate = currentDate.minusYears(120);
        if (request.getBirthDate().isBefore(maximumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Invalid birth date");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email is required");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!request.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Invalid email format");
        }

        // Validate phone number
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number is required");
        }

        // Vietnamese phone number validation (10-11 digits, starts with 0)
        String phoneRegex = "^0[0-9]{9,10}$";
        String cleanPhone = request.getPhone().trim().replaceAll("\\s", "");
        if (!cleanPhone.matches(phoneRegex)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Phone number must be 10-11 digits and start with 0");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password is required");
        }

        if (request.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must be at least 6 characters long");
        }

        if (request.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Password must not exceed 128 characters");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!request.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK, "Password must contain at least one letter and one number");
        }
    }
}
