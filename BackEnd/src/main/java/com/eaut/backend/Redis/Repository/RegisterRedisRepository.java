package com.eaut.backend.Redis.Repository;

import com.eaut.backend.Model.Request.RegisterRequest;
import com.eaut.backend.Redis.Entities.RedisRegisterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegisterRedisRepository extends JpaRepository<RedisRegisterEntity<RegisterRequest>, String> {
}
