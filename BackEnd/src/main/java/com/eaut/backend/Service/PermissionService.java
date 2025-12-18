package com.eaut.backend.Service;

import com.eaut.backend.Model.Request.PermissionRequest;
import com.eaut.backend.Model.Response.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse create(PermissionRequest request);

    List<PermissionResponse> getAllPermission();

    void delete(String permissionName);
}
