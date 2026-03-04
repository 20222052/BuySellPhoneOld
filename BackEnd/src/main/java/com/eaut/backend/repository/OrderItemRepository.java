package com.eaut.backend.repository;

import com.eaut.backend.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    // Dashboard Report Queries
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.qty) FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'completed'")
    Long sumTotalSoldProductsByDateRange(@org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start, 
                                         @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT new map(FUNCTION('DATE', o.createdAt) as date, SUM(oi.qty) as sold) " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'completed' " +
           "GROUP BY FUNCTION('DATE', o.createdAt) ORDER BY FUNCTION('DATE', o.createdAt)")
    List<java.util.Map<String, Object>> getDailySoldProductsStats(@org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start, 
                                                                  @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT new map(p.id as id, p.name as name, SUM(oi.qty) as sold, SUM(oi.totalPrice) as revenue) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.productItem pi " +
           "JOIN pi.product p " +
           "WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'completed' " +
           "GROUP BY p.id, p.name ORDER BY SUM(oi.qty) DESC")
    List<java.util.Map<String, Object>> getTopSellingProducts(@org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start, 
                                                              @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end,
                                                              org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT new map(c.name as category, COUNT(DISTINCT p.id) as count, SUM(oi.qty) as sold, SUM(oi.totalPrice) as revenue) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.productItem pi " +
           "JOIN pi.product p " +
           "JOIN p.category c " +
           "WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'completed' " +
           "GROUP BY c.id, c.name ORDER BY SUM(oi.qty) DESC")
    List<java.util.Map<String, Object>> getCategoryBreakdown(@org.springframework.data.repository.query.Param("start") java.time.OffsetDateTime start, 
                                                             @org.springframework.data.repository.query.Param("end") java.time.OffsetDateTime end);
}
