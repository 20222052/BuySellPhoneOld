package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRatingRepository extends JpaRepository<ProductRating, UUID> {

        @Query("""
                        SELECT pr
                        FROM ProductRating pr
                        LEFT JOIN FETCH pr.user
                        WHERE pr.product.id = :productId
                        ORDER BY pr.createdAt DESC
                        """)
        List<ProductRating> findByProductId(@Param("productId") UUID productId);

        @Query("""
                        SELECT AVG(pr.rating)
                        FROM ProductRating pr
                        WHERE pr.product.id = :productId
                        """)
        Double getAverageRatingByProductId(@Param("productId") UUID productId);

        @Query("""
                        SELECT COUNT(pr)
                        FROM ProductRating pr
                        WHERE pr.product.id = :productId
                        """)
        Integer countByProductId(@Param("productId") UUID productId);

        // Batch query: Get rating stats for multiple products
        @Query("""
                        SELECT pr.product.id, AVG(pr.rating), COUNT(pr)
                        FROM ProductRating pr
                        WHERE pr.product.id IN :productIds
                        GROUP BY pr.product.id
                        """)
        List<Object[]> getRatingStatsByProductIds(@Param("productIds") List<UUID> productIds);
}
