package com.eaut.backend.repository;

import com.eaut.backend.constant.DiagnosticStatus;
import com.eaut.backend.entities.ProductDiagnostic;
import com.eaut.backend.entities.ProductItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
     * Tìm tất cả diagnostic của một product item với eager fetch để tránh lazy
     * loading
     */
    @Query("SELECT pd FROM ProductDiagnostic pd " +
            "LEFT JOIN FETCH pd.createdBy " +
            "LEFT JOIN FETCH pd.productItem " +
            "LEFT JOIN FETCH pd.staff " +
            "WHERE pd.productItem.id = :productItemId")
    List<ProductDiagnostic> findByProductItemIdWithJoinFetch(@Param("productItemId") UUID productItemId);

    /**
     * Tìm diagnostic mới nhất của một product item
     */
    @Query("SELECT pd FROM ProductDiagnostic pd WHERE pd.productItem.id = :productItemId ORDER BY pd.testDate DESC LIMIT 1")
    Optional<ProductDiagnostic> findLatestByProductItemId(@Param("productItemId") UUID productItemId);

    /**
     * Tìm diagnostic mới nhất của một product item với eager fetch để tránh lazy
     * loading
     */
    @Query("SELECT pd FROM ProductDiagnostic pd " +
            "LEFT JOIN FETCH pd.createdBy " +
            "LEFT JOIN FETCH pd.productItem " +
            "LEFT JOIN FETCH pd.staff " +
            "WHERE pd.productItem.id = :productItemId " +
            "ORDER BY pd.testDate DESC LIMIT 1")
    Optional<ProductDiagnostic> findLatestByProductItemIdWithJoinFetch(@Param("productItemId") UUID productItemId);

    /**
     * Tìm tất cả diagnostic theo staff
     */
    List<ProductDiagnostic> findByStaffId(UUID staffId);

    /**
     * Tìm diagnostic theo status (với pagination)
     */
    Page<ProductDiagnostic> findByStatus(DiagnosticStatus status, Pageable pageable);

    /**
     * Tìm tất cả diagnostic của một user (người tạo)
     */
    List<ProductDiagnostic> findByCreatedBy_Id(UUID userId);

    /**
     * Tìm tất cả diagnostic của một user với eager fetch để tránh lazy loading
     */
    @Query("SELECT pd FROM ProductDiagnostic pd " +
            "LEFT JOIN FETCH pd.createdBy " +
            "LEFT JOIN FETCH pd.productItem " +
            "LEFT JOIN FETCH pd.staff " +
            "WHERE pd.createdBy.id = :userId")
    List<ProductDiagnostic> findByCreatedBy_IdWithJoinFetch(@Param("userId") UUID userId);

    /**
     * Tìm diagnostic theo ID với eager fetch để tránh lazy loading
     */
    @Query("SELECT pd FROM ProductDiagnostic pd " +
            "LEFT JOIN FETCH pd.createdBy " +
            "LEFT JOIN FETCH pd.productItem " +
            "LEFT JOIN FETCH pd.staff " +
            "WHERE pd.id = :diagnosticId")
    Optional<ProductDiagnostic> findByIdWithJoinFetch(@Param("diagnosticId") UUID diagnosticId);
}
