package com.eaut.backend.untils;

import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.request.UserUpdateRequest;
import com.eaut.backend.constant.ErrorCode;

import java.time.LocalDate;

public class Validate {
    public static void validateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email là bắt buộc");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Định dạng email không hợp lệ");
        }

        // Validate password
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu là bắt buộc");
        }

        if (registerRequest.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu phải có ít nhất 6 ký tự");
        }

        if (registerRequest.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu không được quá 128 ký tự");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!registerRequest.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK,
                    "Mật khẩu phải chứa ít nhất một chữ cái và một chữ số");
        }
    }

    public static void UserServiceValidateRegisterForm(RegisterRequest registerRequest) throws ApplicationException {
        // Validate full name
        if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Họ tên là bắt buộc");
        }
        if (registerRequest.getFullName().trim().length() < 2) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Họ tên phải có ít nhất 2 ký tự");
        }
        if (registerRequest.getFullName().trim().length() > 100) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Họ tên không được quá 100 ký tự");
        }

        // Validate gender
        if (registerRequest.getGender() == null) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Giới tính là bắt buộc");
        }

        // Validate birth date
        if (registerRequest.getBirthDate() == null) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh là bắt buộc");
        }

        // Check if birth date is not in the future
        LocalDate currentDate = LocalDate.now();
        if (registerRequest.getBirthDate().isAfter(currentDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh không thể là ngày trong tương lai");
        }

        // Check minimum age (13 years old)
        LocalDate minimumBirthDate = currentDate.minusYears(13);
        if (registerRequest.getBirthDate().isAfter(minimumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Bạn phải ít nhất 13 tuổi để đăng ký");
        }

        // Check maximum age (120 years old)
        LocalDate maximumBirthDate = currentDate.minusYears(120);
        if (registerRequest.getBirthDate().isBefore(maximumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh không hợp lệ");
        }

        // Validate email
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email là bắt buộc");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!registerRequest.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Định dạng email không hợp lệ");
        }

        // Validate phone number
        if (registerRequest.getPhone() == null || registerRequest.getPhone().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Số điện thoại là bắt buộc");
        }

        // Vietnamese phone number validation (10-11 digits, starts with 0)
        String phoneRegex = "^0[0-9]{9,10}$";
        String cleanPhone = registerRequest.getPhone().trim().replaceAll("\\s", "");
        if (!cleanPhone.matches(phoneRegex)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID,
                    "Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0");
        }

        // Validate password
        if (registerRequest.getPassword() == null || registerRequest.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu là bắt buộc");
        }

        if (registerRequest.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu phải có ít nhất 6 ký tự");
        }

        if (registerRequest.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu không được quá 128 ký tự");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!registerRequest.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK,
                    "Mật khẩu phải chứa ít nhất một chữ cái và một chữ số");
        }
    }

    public static void UserServiceValidateUpdateForm(UserUpdateRequest request) throws ApplicationException {
        // Validate full name
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Họ tên là bắt buộc");
        }
        if (request.getFullName().trim().length() < 2) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Họ tên phải có ít nhất 2 ký tự");
        }
        if (request.getFullName().trim().length() > 100) {
            throw new ApplicationException(ErrorCode.INVALID_FORMAT, "Họ tên không được quá 100 ký tự");
        }

        // Validate gender
        if (request.getGender() == null) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED, "Giới tính là bắt buộc");
        }

        // Validate birth date
        if (request.getBirthDate() == null) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh là bắt buộc");
        }

        // Check if birth date is not in the future
        LocalDate currentDate = LocalDate.now();
        if (request.getBirthDate().isAfter(currentDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh không thể là ngày trong tương lai");
        }

        // Check minimum age (13 years old)
        LocalDate minimumBirthDate = currentDate.minusYears(13);
        if (request.getBirthDate().isAfter(minimumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Bạn phải ít nhất 13 tuổi để đăng ký");
        }

        // Check maximum age (120 years old)
        LocalDate maximumBirthDate = currentDate.minusYears(120);
        if (request.getBirthDate().isBefore(maximumBirthDate)) {
            throw new ApplicationException(ErrorCode.DATE_INVALID, "Ngày sinh không hợp lệ");
        }

        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Email là bắt buộc");
        }

        // Basic email format validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!request.getEmail().trim().matches(emailRegex)) {
            throw new ApplicationException(ErrorCode.EMAIL_INVALID, "Định dạng email không hợp lệ");
        }

        // Validate phone number
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "Số điện thoại là bắt buộc");
        }

        // Vietnamese phone number validation (10-11 digits, starts with 0)
        String phoneRegex = "^0[0-9]{9,10}$";
        String cleanPhone = request.getPhone().trim().replaceAll("\\s", "");
        if (!cleanPhone.matches(phoneRegex)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID,
                    "Số điện thoại phải có 10-11 chữ số và bắt đầu bằng số 0");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu là bắt buộc");
        }

        if (request.getPassword().length() < 6) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu phải có ít nhất 6 ký tự");
        }

        if (request.getPassword().length() > 128) {
            throw new ApplicationException(ErrorCode.PASSWORD_INVALID, "Mật khẩu không được quá 128 ký tự");
        }

        // Password strength validation (at least one letter and one number)
        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d).+$";
        if (!request.getPassword().matches(passwordRegex)) {
            throw new ApplicationException(ErrorCode.PASSWORD_TOO_WEAK,
                    "Mật khẩu phải chứa ít nhất một chữ cái và một chữ số");
        }
    }
}
