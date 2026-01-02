package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface ProductRatingRepository extends JpaRepository<ProductRating, UUID> {

}
