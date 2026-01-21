package com.eaut.backend.controller;

import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.*;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.AuthenticationReponse;
import com.eaut.backend.model.response.IntrospectResponse;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;

@CrossOrigin(origins = "*")
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    final AuthenticationService authenticationServiceImpl;

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationServiceImpl.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .data(result).build();
    }

    /**
     * Forgot password - Send OTP to email
     */
    @PostMapping("forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) throws ApplicationException {
        log.info("🌐 [API] Forgot Password request received for Email: {}", forgotPasswordRequest.getEmail());
        authenticationServiceImpl.forgotPassword(forgotPasswordRequest);
        ApiResponse<String> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                "OTP sent to email successfully");
        log.info("AuthenticationController: OTP sent to email successfully: {}", forgotPasswordRequest.getEmail());
        return apiResponse;
    }
    /**
     * Forgot Password Confirm OTP and Update new password
     */
    @PostMapping("forgot-password-confirm-otp")
    public ApiResponse<String> forgotPasswordConfirmOtp(@RequestBody ConfirmOtpRegisterRequest request) throws ApplicationException {
        log.info("🌐 [API] Confirm OTP request received for Email: {}", request.getEmail());
        authenticationServiceImpl.confirmForgotPassword(request);
        ApiResponse<String> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                "Password updated successfully");
        log.info("AuthenticationController: Password updated successfully for Email: {}", request.getEmail());
        return apiResponse;
    }

    /**
     * Confirm OTP and complete registration
     */
    @PostMapping("confirm-otp")
    public ApiResponse<AuthenticationReponse<UserResponse>> confirmOtp(@RequestBody ConfirmOtpRegisterRequest request) throws ApplicationException {
        log.info("🌐 [API] Confirm OTP request received for Email: {}", request.getEmail());

        AuthenticationReponse<UserResponse> result = authenticationServiceImpl.confirmOtpAndRegister(request);
        ApiResponse<AuthenticationReponse<UserResponse>> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                result);
        log.info("AuthenticationController: User Login successfully with Email: {}", request.getEmail());
        return apiResponse;
    }

    @PostMapping("/login")
    public ApiResponse<AuthenticationReponse<UserResponse>> login(@RequestBody LoginRequest loginRequest) {
        AuthenticationReponse<UserResponse> result = authenticationServiceImpl.authenticated(loginRequest);
        ApiResponse<AuthenticationReponse<UserResponse>> apiResponse = new ApiResponse(
                HttpStatus.OK.value(),
                result);
        log.info("AuthenticationController: User Login successfully with Email: {}", loginRequest.getEmail());
        return apiResponse;
    }

    @GetMapping("/logout")
    public ApiResponse<AuthenticationReponse<UserResponse>> logout() throws ParseException, JOSEException {
        AuthenticationReponse<UserResponse> result = authenticationServiceImpl.logout();
        ApiResponse<AuthenticationReponse<UserResponse>> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                result);
//        log.info("AuthenticationController: User Logout successfully with Id: {}", logoutRequest.getToken());
        return apiResponse;
    }
}
