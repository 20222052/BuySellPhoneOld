package com.eaut.backend.service;

import com.eaut.backend.model.request.*;
import com.eaut.backend.model.response.AuthenticationReponse;
import com.eaut.backend.model.response.IntrospectResponse;
import com.eaut.backend.model.response.RegisterReponse;
import com.eaut.backend.model.response.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {

    public IntrospectResponse introspect(IntrospectRequest request);

    public AuthenticationReponse<UserResponse> confirmOtpAndRegister(ConfirmOtpRegisterRequest request);

    public RegisterReponse forgotPassword(ForgotPasswordRequest fgpwRequest);

    public AuthenticationReponse<UserResponse> confirmForgotPassword(ConfirmOtpRegisterRequest request);

    public AuthenticationReponse<UserResponse> authenticated(LoginRequest loginRequest);

    public AuthenticationReponse<UserResponse> outboundAuthenticate(ExchangeTokenRequest request);

    public AuthenticationReponse<UserResponse> logout() throws ParseException, JOSEException;

}
