package com.eaut.backend.schedule;

import com.eaut.backend.service.tokenService.InvalidateTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvalidateTokenScheduler {

    private final InvalidateTokenService tokenService;

    // Chạy mỗi ngày lúc 00:00
    @Scheduled(cron = "0 0 0 * * ?")
//    @Scheduled(cron = "*/10 * * * * ?") // 10 giây chạy 1 lần
    public void cleanupExpiredTokens() {
        int deleted = tokenService.deleteExpiredTokens();
        log.info("Deleted {} expired invalidate tokens", deleted);
    }
}

