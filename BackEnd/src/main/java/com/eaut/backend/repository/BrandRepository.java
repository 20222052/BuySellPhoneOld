package com.eaut.backend.repository;

import com.eaut.backend.entities.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    Boolean existsByName(String name);

    // Thêm method này để tránh conflict khi update
    Boolean existsByNameAndIdNot(String name, UUID id);

    @Query("""
            SELECT DISTINCT b
            FROM Brand b
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(b.name) LIKE :searchPattern
                )
            """)
    Page<Brand> getAllBrands(
            @Param("searchPattern") String searchPattern,
            Pageable pageable);

}
