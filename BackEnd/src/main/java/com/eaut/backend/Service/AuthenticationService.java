package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.*;
import com.eaut.backend.Model.Response.AuthenticationReponse;
import com.eaut.backend.Model.Response.IntrospectResponse;
import com.eaut.backend.Model.Response.RegisterReponse;
import com.eaut.backend.Model.Response.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {

    public IntrospectResponse introspect(IntrospectRequest request);
    public AuthenticationReponse<UserResponse> confirmOtpAndRegister(ConfirmOtpRegisterRequest request);
    public RegisterReponse forgotPassword(ForgotPasswordRequest fgpwRequest);
    public AuthenticationReponse<UserResponse> confirmForgotPassword(ConfirmOtpRegisterRequest request);
    public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest);
    public AuthenticationReponse<UserResponse> logout() throws ParseException, JOSEException;

}
