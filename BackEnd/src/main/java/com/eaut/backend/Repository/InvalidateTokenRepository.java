package com.eaut.backend.Repository;

import com.eaut.backend.Entity.InvalidateToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, String> {
}
