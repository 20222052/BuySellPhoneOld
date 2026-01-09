package com.eaut.backend.service.tokenService.impl;

import com.eaut.backend.repository.InvalidateTokenRepository;
import com.eaut.backend.service.tokenService.InvalidateTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvalidateTokenServiceImpl implements InvalidateTokenService {
    private final InvalidateTokenRepository repository;
    @Override
    public int deleteExpiredTokens() {
        int record = repository.deleteExpiredTokens(new Date());
        log.info("Delete token record:{}", record);
        return record;
    }
}
