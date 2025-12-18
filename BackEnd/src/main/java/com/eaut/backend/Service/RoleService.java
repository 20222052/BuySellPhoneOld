package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.PermissionRequest;
import com.eaut.backend.Model.Request.RoleRequest;
import com.eaut.backend.Model.Response.PermissionResponse;
import com.eaut.backend.Model.Response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleRequest request);

    List<RoleResponse> getAllRole();

    void delete(String roleName);
}
