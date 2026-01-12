package com.eaut.backend.service;

/**
 * Service for distributed locking using Redis
 * Used to prevent race conditions during checkout
 */
public interface DistributedLockService {

    /**
     * Attempt to acquire a lock for the given key
     * 
     * @param key            The lock key (e.g., "checkout:lock:productColor:{id}")
     * @param timeoutMs      Maximum time to wait for lock acquisition
     * @param lockDurationMs How long the lock should be held
     * @return true if lock was acquired, false otherwise
     */
    boolean acquireLock(String key, long timeoutMs, long lockDurationMs);

    /**
     * Release the lock for the given key
     * 
     * @param key The lock key
     */
    void releaseLock(String key);

    /**
     * Check if a lock exists for the given key
     * 
     * @param key The lock key
     * @return true if lock exists
     */
    boolean isLocked(String key);
}
