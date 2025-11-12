package com.eaut.backend.Model.Response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthenticationReponse<T> {
    boolean authenticated;
    boolean logout;
    String token;
    String refreshToken;
    T data;

    public AuthenticationReponse(boolean b) {
        this.authenticated = b;
    }

    public AuthenticationReponse(boolean b, T data) {
        this.authenticated = b;
        this.data = data;
    }

    public AuthenticationReponse(boolean b, String token, T data) {
        this.authenticated = b;
        this.data = data;
        this.token = token;
    }

    public AuthenticationReponse(boolean b, String token, String refreshToken, T data) {
        this.authenticated = b;
        this.data = data;
        this.token = token;
        this.refreshToken = refreshToken;
    }
}
