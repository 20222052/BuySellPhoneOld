package com.eaut.backend.Config;

import java.text.ParseException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import com.eaut.backend.Domain.OtpDomain;
import com.eaut.backend.Exception.ApplicationException;
import com.eaut.backend.Model.Request.IntrospectRequest;
import com.eaut.backend.Model.Sercurity.TokenInfo;
import com.eaut.backend.Repository.InvalidateTokenRepository;
import com.eaut.backend.Service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
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
        try {
            // Verify token using OtpDomain
            otpDomain.verifyToken(token);

            // Get token info
            TokenInfo tokenInfo = otpDomain.getTokenInfo(token);

            // Check if token is in blacklist
            if (invalidateTokenRepository.existsById(tokenInfo.getJwtId().toString())) {
                throw new JwtException("Token has been invalidated (logged out)");
            }

            // Convert to Spring Security Jwt object
            return convertToJwt(tokenInfo);

        } catch (ApplicationException | ParseException | JOSEException e) {
            log.error("JWT validation failed: {}", e.getMessage());
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
        claims.put("exp", tokenInfo.getExpiration() / 1000); // Convert to seconds
        claims.put("iat", tokenInfo.getIssuedAt() / 1000);

        Instant issuedAt = Instant.ofEpochMilli(tokenInfo.getIssuedAt());
        Instant expiresAt = Instant.ofEpochMilli(tokenInfo.getExpiration());

        return new Jwt(
                tokenInfo.getJwtId().toString(),
                issuedAt,
                expiresAt,
                headers,
                claims
        );
    }
}