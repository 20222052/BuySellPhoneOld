package com.eaut.backend.repository;

import com.eaut.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUserId(UUID userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByCode(String code);

    boolean existsByCode(String code);
}
