package com.eaut.backend.redis.repository;

import com.eaut.backend.redis.entities.OtpLimitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpLimitRedisRepository extends JpaRepository<OtpLimitEntity, String> {
}
