package com.eaut.backend.Repository;

import com.eaut.backend.Entity.Brand;
import com.eaut.backend.Entity.ProductColor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColor, UUID> {
    Boolean existsByName(String name);
    Boolean existsByHexCode(String hexCode);

    // Thêm method này để tránh conflict khi update
    Boolean existsByNameAndIdNot(String name, UUID id);

    @Query("""
            SELECT DISTINCT p
            FROM ProductColor p
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(p.name) LIKE :searchPattern OR
                    LOWER(p.hexCode) LIKE :searchPattern
                )
           """)
    Page<ProductColor> getAllProductColor(
            @Param("searchPattern") String searchPattern,
            Pageable pageable);

}
