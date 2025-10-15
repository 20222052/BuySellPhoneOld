package com.eaut.backend.Repository;

import com.eaut.backend.Entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    Optional<User> findByEmail(String email);

    // Kiểm tra email có tồn tại với user ID khác không
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.id != :userId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("userId") UUID userId);
    
    // Kiểm tra phone có tồn tại với user ID khác không
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.phone = :phone AND u.id != :userId")
    boolean existsByPhoneAndIdNot(@Param("phone") String phone, @Param("userId") UUID userId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.accessToken = :token, u.expiresAt = :expiresAt WHERE u.id = :id")
    int updateTokenAndExpiry(@Param("id") UUID id,
                             @Param("token") String token,
                             @Param("expiresAt") OffsetDateTime expiresAt);@Modifying
    @Transactional
    @Query("UPDATE User u SET u.accessToken = :token WHERE u.id = :id")
    int updateToken(@Param("id") UUID id,
                    @Param("token") String token);
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.accessToken = :token, u.expiresAt = :expiresAt, u.accessToken = :refreshToken WHERE u.id = :id")
    int updateTokenAndExpiryAndRefreshToken(@Param("id") UUID id,
                             @Param("token") String token,
                             @Param("expiresAt") OffsetDateTime expiresAt,
                             @Param("refreshToken") String refreshToken);

}
