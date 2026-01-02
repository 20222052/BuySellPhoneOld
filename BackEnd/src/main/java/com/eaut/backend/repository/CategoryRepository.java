package com.eaut.backend.repository;

import com.eaut.backend.entities.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Boolean existsByName(String name);

    // Thêm method này để tránh conflict khi update
    Boolean existsByNameAndIdNot(String name, UUID id);

    @Query("""
            SELECT DISTINCT c
            FROM Category c
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(c.name) LIKE :searchPattern OR
                    LOWER(c.description) LIKE :searchPattern OR
                    LOWER(c.image) LIKE :searchPattern
                )
            AND (
                :isActive IS NULL OR :isActive = ''
                OR CAST(c.isActive AS string) = :isActive
            )
            """)
    Page<Category> getAllCategories(
            @Param("searchPattern") String searchPattern,
            @Param("isActive") String isActive,
            Pageable pageable);

    // Query mới: fetch join để load createdBy và modifiedBy cùng lúc
    @Query("""
            SELECT c FROM Category c
            LEFT JOIN FETCH c.createdBy
            LEFT JOIN FETCH c.modifiedBy
            WHERE c.id = :id
            """)
    Optional<Category> findByIdWithAuditors(@Param("id") UUID id);
}
