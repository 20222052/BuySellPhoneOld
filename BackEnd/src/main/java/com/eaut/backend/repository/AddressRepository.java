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

    List<Address> findByUserId(UUID userId);

    Optional<Address> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isDefault = true")
    Optional<Address> findDefaultByUserId(@Param("userId") UUID userId);
}
