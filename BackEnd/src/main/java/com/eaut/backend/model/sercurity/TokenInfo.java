package com.eaut.backend.model.sercurity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenInfo {
    UUID jwtId;
    String subject;
    Long issuedAt;
    Long expiration;
    String scope;
}
