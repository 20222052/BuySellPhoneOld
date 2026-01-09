package com.eaut.backend.service.tokenService;

public interface InvalidateTokenService {
    public int deleteExpiredTokens();
}
