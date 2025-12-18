package com.eaut.backend.Repository;

import com.eaut.backend.Entity.Permission;
import com.eaut.backend.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {}
