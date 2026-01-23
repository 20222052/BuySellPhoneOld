package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductDiagnostic;
import com.eaut.backend.entities.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductDiagnosticRepository extends JpaRepository<ProductDiagnostic, UUID> {

    /**
     * Tìm tất cả diagnostic của một product item
     */
    List<ProductDiagnostic> findByProductItemId(UUID productItemId);

    /**
     * Tìm diagnostic mới nhất của một product item
     */
    @Query("SELECT pd FROM ProductDiagnostic pd WHERE pd.productItem.id = :productItemId ORDER BY pd.testDate DESC LIMIT 1")
    Optional<ProductDiagnostic> findLatestByProductItemId(@Param("productItemId") UUID productItemId);

    /**
     * Tìm tất cả diagnostic theo staff
     */
    List<ProductDiagnostic> findByStaffId(UUID staffId);

    /**
     * Tìm diagnostic theo status
     */
    @Query("SELECT pd FROM ProductDiagnostic pd WHERE pd.status = :status")
    List<ProductDiagnostic> findByStatus(@Param("status") String status);
}
