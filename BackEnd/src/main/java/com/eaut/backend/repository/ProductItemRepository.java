package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductItemRepository extends JpaRepository<ProductItem, UUID> {

}
