package com.eaut.backend.repository;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, UUID> {

    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.product p
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(p.name) LIKE :searchPattern
                )
                AND (:productId IS NULL OR pi.product.id = :productId)
                AND (:minPrice IS NULL OR pi.sellPrice >= :minPrice)
                AND (:maxPrice IS NULL OR pi.sellPrice <= :maxPrice)
            """)
    Page<ProductItem> getAllProductItems(
            @Param("searchPattern") String searchPattern,
            @Param("productId") UUID productId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    // Query for list with full join (Product, Brand, Category)
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.product p
            LEFT JOIN FETCH p.brand b
            LEFT JOIN FETCH p.category c
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(p.name) LIKE :searchPattern OR
                    LOWER(p.description) LIKE :searchPattern OR
                    LOWER(b.name) LIKE :searchPattern OR
                    LOWER(c.name) LIKE :searchPattern OR
                    LOWER(pi.name) LIKE :searchPattern
                )
                AND (:productId IS NULL OR p.id = :productId)
                AND (:brandId IS NULL OR b.id = :brandId)
                AND (:categoryId IS NULL OR c.id = :categoryId)
                AND (:status IS NULL OR p.status = :status)
                AND (:minPrice IS NULL OR pi.sellPrice >= :minPrice)
                AND (:maxPrice IS NULL OR pi.sellPrice <= :maxPrice)
                AND (:isTradeIn IS NULL OR pi.isTradeIn = :isTradeIn)
            """)
    Page<ProductItem> findAllWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("productId") UUID productId,
            @Param("brandId") UUID brandId,
            @Param("categoryId") UUID categoryId,
            @Param("status") ProductStatus status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isTradeIn") Integer isTradeIn,
            Pageable pageable);

    // Get all product item IDs for batch processing
    @Query("""
            SELECT pi.id
            FROM ProductItem pi
            LEFT JOIN pi.product p
            LEFT JOIN p.brand b
            LEFT JOIN p.category c
            WHERE
                (:searchPattern IS NULL OR :searchPattern = '' OR
                    LOWER(p.name) LIKE :searchPattern OR
                    LOWER(p.description) LIKE :searchPattern OR
                    LOWER(b.name) LIKE :searchPattern OR
                    LOWER(c.name) LIKE :searchPattern
                )
                AND (:productId IS NULL OR p.id = :productId)
                AND (:brandId IS NULL OR b.id = :brandId)
                AND (:categoryId IS NULL OR c.id = :categoryId)
                AND (:status IS NULL OR p.status = :status)
                AND (:minPrice IS NULL OR pi.sellPrice >= :minPrice)
                AND (:maxPrice IS NULL OR pi.sellPrice <= :maxPrice)
                AND (:isTradeIn IS NULL OR pi.isTradeIn = :isTradeIn)
            """)
    Page<UUID> findAllIdsWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("productId") UUID productId,
            @Param("brandId") UUID brandId,
            @Param("categoryId") UUID categoryId,
            @Param("status") ProductStatus status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isTradeIn") Integer isTradeIn,
            Pageable pageable);

    // Fetch ProductItems by IDs with full join
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.product p
            LEFT JOIN FETCH p.brand
            LEFT JOIN FETCH p.category
            WHERE pi.id IN :ids
            """)
    List<ProductItem> findByIdsWithProduct(@Param("ids") List<UUID> ids);

    // Query 1: Fetch ProductItem with Product, Brand, Category
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.product p
            LEFT JOIN FETCH p.brand
            LEFT JOIN FETCH p.category
            WHERE pi.id = :id
            """)
    Optional<ProductItem> findByIdWithProduct(@Param("id") UUID id);

    // Query 2: Fetch ProductItem with Media
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.productMedia
            WHERE pi.id = :id
            """)
    Optional<ProductItem> findByIdWithMedia(@Param("id") UUID id);

    // Query 3: Fetch ProductItem with Models
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.models
            WHERE pi.id = :id
            """)
    Optional<ProductItem> findByIdWithModels(@Param("id") UUID id);

    // Query for RAG Step 1: Fetch ProductItem with Product, Brand, Category, and
    // Models
    // Không fetch colors ở đây để tránh MultipleBagFetchException
    @Query("""
            SELECT DISTINCT pi
            FROM ProductItem pi
            LEFT JOIN FETCH pi.product p
            LEFT JOIN FETCH p.brand
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH pi.models m
            WHERE pi.id = :id
            """)
    Optional<ProductItem> findByIdWithProductAndModels(@Param("id") UUID id);

    // Query for RAG Step 2: Fetch Colors for ProductItem's Models
    // Đây là query riêng để load colors sau khi đã có models
    @Query("""
            SELECT DISTINCT m
            FROM ProductModel m
            LEFT JOIN FETCH m.colors
            WHERE m.productItem.id = :productItemId
            """)
    List<ProductModel> findModelsWithColorsByProductItemId(@Param("productItemId") UUID productItemId);
}
