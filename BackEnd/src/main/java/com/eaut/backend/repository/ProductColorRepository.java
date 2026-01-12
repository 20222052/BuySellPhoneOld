package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductColor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColor, UUID> {
    Boolean existsByName(String name);

    Boolean existsByHexCode(String hexCode);

    ProductColor findByHexCode(String hexCode);

    // Thêm method này để tránh conflict khi update
    Boolean existsByNameAndIdNot(String name, UUID id);

    // Lấy danh sách màu theo ProductModel
    List<ProductColor> findByProductModelId(UUID productModelId);

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

    /**
     * Find ProductColor with pessimistic write lock for checkout
     * This prevents race conditions when multiple users checkout same product
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pc FROM ProductColor pc WHERE pc.id = :id")
    Optional<ProductColor> findByIdForUpdate(@Param("id") UUID id);

    /**
     * Decrement stock quantity atomically
     * Returns number of rows affected (1 if success, 0 if not enough stock)
     */
    @Modifying
    @Query("UPDATE ProductColor pc SET pc.qtyAvailable = pc.qtyAvailable - :quantity WHERE pc.id = :id AND pc.qtyAvailable >= :quantity")
    int decrementStock(@Param("id") UUID id, @Param("quantity") int quantity);
}
