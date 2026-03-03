package com.eaut.backend.repository;

import com.eaut.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.eaut.backend.constant.PaymentStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    long countByCreatedAtBetween(OffsetDateTime start, OffsetDateTime end);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.createdAt BETWEEN :start AND :end AND o.paymentStatus = :status")
    BigDecimal sumTotalByCreatedAtBetweenAndPaymentStatus(@Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end, @Param("status") PaymentStatus status);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.paymentStatus = :status")
    BigDecimal sumTotalByPaymentStatus(@Param("status") PaymentStatus status);

    @Query("SELECT SUM(oi.qty) FROM OrderItem oi WHERE oi.createdAt BETWEEN :start AND :end AND oi.order.status != 'cancelled'")
    Long sumSoldProductsByCreatedAtBetween(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    List<Order> findByUserId(UUID userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(OffsetDateTime start, OffsetDateTime end);

    Optional<Order> findByCode(String code);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") UUID id);

    boolean existsByCode(String code);

    // Dashboard Report Queries
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countOrdersByDateRange(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end AND o.status = :status")
    long countOrdersByDateRangeAndStatus(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end, @Param("status") com.eaut.backend.constant.OrderStatus status);

    @Query("SELECT SUM(o.total) FROM Order o WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'completed'")
    BigDecimal sumCompletedRevenueByDateRange(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT new map(FUNCTION('DATE', o.createdAt) as date, COUNT(o) as count, SUM(o.total) as revenue) " +
           "FROM Order o WHERE o.createdAt BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', o.createdAt) ORDER BY FUNCTION('DATE', o.createdAt)")
    List<java.util.Map<String, Object>> getDailyOrderStats(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :start AND :end ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByDateRange(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end, org.springframework.data.domain.Pageable pageable);
}
