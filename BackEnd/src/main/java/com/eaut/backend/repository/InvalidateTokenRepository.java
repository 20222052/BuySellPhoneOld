package com.eaut.backend.repository;

import com.eaut.backend.entities.InvalidateToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Repository
public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM InvalidateToken t WHERE t.expiryDate < :now")
    int deleteExpiredTokens(@Param("now") Date now);
}
