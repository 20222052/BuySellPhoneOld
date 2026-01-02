package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel, UUID> {

    List<ProductModel> findByProductItemId(UUID productItemId);

    List<ProductModel> findByProductItemIdOrderByCreatedAtDesc(UUID productItemId);

    boolean existsByNameAndProductItemId(String name, UUID productItemId);

    void deleteByProductItemId(UUID productItemId);
}
