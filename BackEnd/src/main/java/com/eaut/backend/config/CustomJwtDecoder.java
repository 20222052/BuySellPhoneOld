package com.eaut.backend.config;

import java.text.ParseException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import com.eaut.backend.domain.OtpDomain;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.sercurity.TokenInfo;
import com.eaut.backend.repository.InvalidateTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {
    private final OtpDomain otpDomain; // Inject OtpDomain thay vì AuthenticationService
    private final InvalidateTokenRepository invalidateTokenRepository;

    @Override
    public Jwt decode(String token) throws JwtException {
        log.info("[JWT-DECODE] Attempting to decode token: {}",
                token.substring(0, Math.min(20, token.length())) + "...");

        try {
            // Verify token using OtpDomain
            otpDomain.verifyToken(token);
            log.info("[JWT-DECODE] Token verified successfully");

            // Get token info
            TokenInfo tokenInfo = otpDomain.getTokenInfo(token);
            log.info("[JWT-DECODE] Token info - Subject: {}, JwtId: {}, Scope: {}",
                    tokenInfo.getSubject(), tokenInfo.getJwtId(), tokenInfo.getScope());

            // Check if token is in blacklist
            if (invalidateTokenRepository.existsById(tokenInfo.getJwtId().toString())) {
                log.warn("⚠️ [JWT-DECODE] Token has been invalidated (blacklisted)");
                throw new JwtException("Token has been invalidated (logged out)");
            }

            // Convert to Spring Security Jwt object
            Jwt jwt = convertToJwt(tokenInfo);
            log.info("[JWT-DECODE] JWT object created with authorities from scope");

            return jwt;

        } catch (ApplicationException | ParseException | JOSEException e) {
            log.error("[JWT-DECODE] JWT validation failed: {}", e.getMessage());
            throw new JwtException("Invalid token", e);
        }
    }

    private Jwt convertToJwt(TokenInfo tokenInfo) {
        Map<String, Object> headers = new HashMap<>();
        headers.put("alg", "HS512");
        headers.put("typ", "JWT");

        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", tokenInfo.getSubject());
        claims.put("jti", tokenInfo.getJwtId().toString());
        // FIX: Chuyển scope từ string thành list để Spring Security có thể parse
        claims.put("scope", Arrays.asList(tokenInfo.getScope().split(" ")));
        claims.put("exp", tokenInfo.getExpiration() / 1000);
        claims.put("iat", tokenInfo.getIssuedAt() / 1000);

        Instant issuedAt = Instant.ofEpochMilli(tokenInfo.getIssuedAt());
        Instant expiresAt = Instant.ofEpochMilli(tokenInfo.getExpiration());

        return new Jwt(
                tokenInfo.getJwtId().toString(),
                issuedAt,
                expiresAt,
                headers,
                claims);
    }
}