package com.eaut.backend.Repository;

import com.eaut.backend.Entity.InvalidateToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, String> {
}
