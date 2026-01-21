package com.eaut.backend.repository;

import com.eaut.backend.entities.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    Boolean existsByTitle(String title);

    Boolean existsByTitleAndIdNot(String title, UUID id);

    @Query("""
            SELECT DISTINCT b
            FROM Blog b
            LEFT JOIN FETCH b.createdBy
            LEFT JOIN FETCH b.modifiedBy
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(b.title) LIKE :searchPattern OR
                    LOWER(b.content) LIKE :searchPattern OR
                    LOWER(b.author) LIKE :searchPattern
                )
            """)
    Page<Blog> getAllBlogs(
            @Param("searchPattern") String searchPattern,
            Pageable pageable);

    @Query("SELECT b FROM Blog b LEFT JOIN FETCH b.createdBy LEFT JOIN FETCH b.modifiedBy WHERE b.createdBy.id = :userId")
    Page<Blog> findByCreatedById(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Blog b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") UUID id);
}
