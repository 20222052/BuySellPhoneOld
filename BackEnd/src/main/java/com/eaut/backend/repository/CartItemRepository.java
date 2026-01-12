package com.eaut.backend.repository;

import com.eaut.backend.entities.CartItem;
import com.eaut.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByUserAndProductColorId(User user, UUID productColorId);

    List<CartItem> findByUserId(UUID userId);
}
