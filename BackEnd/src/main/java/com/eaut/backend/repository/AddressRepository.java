package com.eaut.backend.repository;

import com.eaut.backend.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUserIdAndIsDeleteFalse(UUID userId);

    Optional<Address> findByIdAndUserIdAndIsDeleteFalse(UUID id, UUID userId);

    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isDefault = true AND a.isDelete = false")
    Optional<Address> findDefaultByUserId(@Param("userId") UUID userId);
}
