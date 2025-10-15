package com.eaut.backend.Model.Response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthenticationReponse<T> {
    boolean authenticated;
    boolean logout;
    T data;

    public AuthenticationReponse(boolean b) {
        this.authenticated = b;
    }

    public AuthenticationReponse(boolean b, T data) {
        this.authenticated = b;
        this.data = data;
    }

}
