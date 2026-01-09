package com.eaut.backend.redis.repository;

import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.redis.entities.RedisRegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisterRedisRepository extends JpaRepository<RedisRegisterEntity<RegisterRequest>, String> {
}
