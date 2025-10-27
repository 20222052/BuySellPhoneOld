package com.eaut.backend.API;

import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.ConfirmOtpRegisterRequest;
import com.eaut.backend.Model.Request.ForgotPasswordRequest;
import com.eaut.backend.Model.Request.LoginRequest;
import com.eaut.backend.Model.Request.LogoutRequest;
import com.eaut.backend.Model.Response.ApiReponse;
import com.eaut.backend.Model.Response.AuthenticationReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.eaut.backend.Service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    final AuthenticationService authenticationService;

    /**
     * Forgot password - Send OTP to email
     */
    @PostMapping("forgot-password")
    public ApiReponse<String> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) throws ApplicationException {
        log.info("🌐 [API] Forgot Password request received for Email: {}", forgotPasswordRequest.getEmail());
        authenticationService.forgotPassword(forgotPasswordRequest);
        ApiReponse<String> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                "OTP sent to email successfully");
        log.info("AuthenticationController: OTP sent to email successfully: {}", forgotPasswordRequest.getEmail());
        return apiReponse;
    }
    /**
     * Forgot Password Confirm OTP and Update new password
     */
    @PostMapping("forgot-password-confirm-otp")
    public ApiReponse<String> forgotPasswordConfirmOtp(@RequestBody ConfirmOtpRegisterRequest request) throws ApplicationException {
        log.info("🌐 [API] Confirm OTP request received for Email: {}", request.getEmail());
        authenticationService.confirmForgotPassword(request);
        ApiReponse<String> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                "Password updated successfully");
        log.info("AuthenticationController: Password updated successfully for Email: {}", request.getEmail());
        return apiReponse;
    }

    /**
     * Confirm OTP and complete registration
     */
    @PostMapping("confirm-otp")
    public ApiReponse<AuthenticationReponse<UserResponse>> confirmOtp(@RequestBody ConfirmOtpRegisterRequest request) throws ApplicationException {
        log.info("🌐 [API] Confirm OTP request received for Email: {}", request.getEmail());

        AuthenticationReponse<UserResponse> result = authenticationService.confirmOtpAndRegister(request);
        ApiReponse<AuthenticationReponse<UserResponse>> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                result);
        log.info("AuthenticationController: User Login successfully with Email: {}", request.getEmail());
        return apiReponse;
    }

    @PostMapping("/login")
    public ApiReponse<AuthenticationReponse<UserResponse>> login(@RequestBody LoginRequest loginRequest) {
        AuthenticationReponse<UserResponse> result = authenticationService.authenticated(loginRequest);
        ApiReponse<AuthenticationReponse<UserResponse>> apiReponse = new ApiReponse(
                HttpStatus.OK.value(),
                result);
        log.info("AuthenticationController: User Login successfully with Email: {}", loginRequest.getEmail());
        return apiReponse;
    }

    @GetMapping("/logout")
    public ApiReponse<AuthenticationReponse<UserResponse>> logout(@RequestBody LogoutRequest logoutRequest) throws ParseException, JOSEException {
        AuthenticationReponse<UserResponse> result = authenticationService.logout(logoutRequest);
        ApiReponse<AuthenticationReponse<UserResponse>> apiReponse = new ApiReponse<>(
                HttpStatus.OK.value(),
                result);
        log.info("AuthenticationController: User Logout successfully with Id: {}", logoutRequest.getToken());
        return apiReponse;
    }
}
