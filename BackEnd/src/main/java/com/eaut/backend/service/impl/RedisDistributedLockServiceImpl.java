package com.eaut.backend.service.impl;

import com.eaut.backend.service.DistributedLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisDistributedLockServiceImpl implements DistributedLockService {

    private final StringRedisTemplate redisTemplate;

    // Store lock values to verify ownership when releasing
    private final ConcurrentHashMap<String, String> lockValues = new ConcurrentHashMap<>();

    private static final String LOCK_PREFIX = "checkout:lock:";

    @Override
    public boolean acquireLock(String key, long timeoutMs, long lockDurationMs) {
        String lockKey = LOCK_PREFIX + key;
        String lockValue = UUID.randomUUID().toString();

        long startTime = System.currentTimeMillis();
        long endTime = startTime + timeoutMs;

        while (System.currentTimeMillis() < endTime) {
            // Try to set the lock with NX (only if not exists) and expiration
            Boolean acquired = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, lockValue, Duration.ofMillis(lockDurationMs));

            if (Boolean.TRUE.equals(acquired)) {
                lockValues.put(lockKey, lockValue);
                log.info("Lock acquired for key: {}", lockKey);
                return true;
            }

            // Wait a bit before retrying
            try {
                TimeUnit.MILLISECONDS.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }

        log.warn("Failed to acquire lock for key: {} within timeout: {}ms", lockKey, timeoutMs);
        return false;
    }

    @Override
    public void releaseLock(String key) {
        String lockKey = LOCK_PREFIX + key;
        String expectedValue = lockValues.get(lockKey);

        if (expectedValue != null) {
            String currentValue = redisTemplate.opsForValue().get(lockKey);

            // Only delete if we own the lock (value matches)
            if (expectedValue.equals(currentValue)) {
                redisTemplate.delete(lockKey);
                lockValues.remove(lockKey);
                log.info("Lock released for key: {}", lockKey);
            } else {
                log.warn("Lock value mismatch for key: {}, expected: {}, actual: {}",
                        lockKey, expectedValue, currentValue);
            }
        }
    }

    @Override
    public boolean isLocked(String key) {
        String lockKey = LOCK_PREFIX + key;
        return Boolean.TRUE.equals(redisTemplate.hasKey(lockKey));
    }
}
