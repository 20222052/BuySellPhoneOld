package com.eaut.backend.Repository;

import com.eaut.backend.Entity.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel, UUID> {

}
