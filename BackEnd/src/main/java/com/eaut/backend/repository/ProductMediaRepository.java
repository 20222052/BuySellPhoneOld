package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, UUID> {
    List<ProductMedia> findByProductItemIdOrderBySortOrderAsc(UUID productItemId);

    void deleteByProductItemId(UUID productItemId);

    List<ProductMedia> findByProductItemId(UUID productItemId);

    // Get primary image or first image by sort order
    @Query("""
            SELECT pm
            FROM ProductMedia pm
            WHERE pm.productItem.id = :productItemId
            ORDER BY pm.isPrimary DESC, pm.sortOrder ASC
            """)
    List<ProductMedia> findByProductItemIdOrderByPrimaryAndSortOrder(@Param("productItemId") UUID productItemId);

    // Get first image for a product item
    default Optional<ProductMedia> findFirstImageByProductItemId(UUID productItemId) {
        List<ProductMedia> mediaList = findByProductItemIdOrderByPrimaryAndSortOrder(productItemId);
        return mediaList.isEmpty() ? Optional.empty() : Optional.of(mediaList.get(0));
    }

    // Batch query: Get first image for multiple product items
    @Query("""
            SELECT pm
            FROM ProductMedia pm
            WHERE pm.productItem.id IN :productItemIds
            ORDER BY pm.productItem.id, pm.isPrimary DESC, pm.sortOrder ASC
            """)
    List<ProductMedia> findAllByProductItemIdsOrdered(@Param("productItemIds") List<UUID> productItemIds);
}
