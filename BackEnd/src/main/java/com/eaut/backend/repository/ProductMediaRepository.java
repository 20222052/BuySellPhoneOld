package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, UUID> {
    List<ProductMedia> findByProductItemIdOrderBySortOrderAsc(UUID productItemId);

    void deleteByProductItemId(UUID productItemId);

    List<ProductMedia> findByProductItemId(UUID productItemId);
}
