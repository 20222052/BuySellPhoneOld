package com.eaut.backend.service;

import com.eaut.backend.model.request.RoleRequest;
import com.eaut.backend.model.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleRequest request);

    List<RoleResponse> getAllRole();

    void delete(String roleName);
}
