package com.eaut.backend.repository;

import com.eaut.backend.entities.Product;
import com.eaut.backend.constant.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Boolean existsByName(String name);

    Boolean existsByNameAndIdNot(String name, UUID id);

    @Query("""
            SELECT DISTINCT p
            FROM Product p
            LEFT JOIN FETCH p.brand b
            LEFT JOIN FETCH p.category c
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(p.name) LIKE :searchPattern OR
                    LOWER(p.description) LIKE :searchPattern OR
                    LOWER(b.name) LIKE :searchPattern OR
                    LOWER(c.name) LIKE :searchPattern
                )
                AND (:brandId IS NULL OR p.brand.id = :brandId)
                AND (:categoryId IS NULL OR p.category.id = :categoryId)
                AND (:status IS NULL OR p.status = :status)
            """)
    Page<Product> getAllProducts(
            @Param("searchPattern") String searchPattern,
            @Param("brandId") UUID brandId,
            @Param("categoryId") UUID categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable);

    // Dashboard Report Queries
    
    @Query("SELECT COUNT(p) FROM Product p")
    long countTotalProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.status = :status")
    long countProductsByStatus(@Param("status") ProductStatus status);
}
