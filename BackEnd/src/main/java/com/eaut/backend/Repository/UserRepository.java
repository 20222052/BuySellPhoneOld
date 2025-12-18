package com.eaut.backend.Repository;

import com.eaut.backend.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByEmail(String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.id != :userId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.phone = :phone AND u.id != :userId")
    boolean existsByPhoneAndIdNot(@Param("phone") String phone, @Param("userId") UUID userId);

    @Query("""
        SELECT DISTINCT u 
        FROM User u
        LEFT JOIN u.roles r
        LEFT JOIN r.permissions p
        WHERE 
            (:searchPattern IS NULL OR :searchPattern = '' OR 
                LOWER(u.fullName) LIKE :searchPattern OR
                LOWER(u.phone) LIKE :searchPattern OR
                LOWER(u.email) LIKE :searchPattern
            )
        AND (
            :status IS NULL OR :status = '' 
            OR CAST(u.status AS string) = :status
        )
        AND (
            :roleName IS NULL OR :roleName = '' 
            OR r.name = :roleName
        )
        AND (
            :permissionName IS NULL OR :permissionName = ''
            OR p.name = :permissionName
        )
        """)
    Page<User> getAllUsers(
            @Param("searchPattern") String searchPattern,
            @Param("roleName") String roleName,
            @Param("permissionName") String permissionName,
            @Param("status") String status,
            Pageable pageable);

}
