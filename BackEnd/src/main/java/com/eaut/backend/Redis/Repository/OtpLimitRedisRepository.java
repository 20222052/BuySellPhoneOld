package com.eaut.backend.Redis.Repository;

import com.eaut.backend.Redis.Entities.OtpLimitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpLimitRedisRepository extends JpaRepository<OtpLimitEntity, String> {
}
