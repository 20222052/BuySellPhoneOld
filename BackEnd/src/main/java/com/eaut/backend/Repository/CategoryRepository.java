package com.eaut.backend.Repository;

import com.eaut.backend.Entity.Category;
import com.eaut.backend.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Boolean existsByName(String name);

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

}
