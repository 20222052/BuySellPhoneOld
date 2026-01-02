package com.eaut.backend.service;

import com.eaut.backend.model.request.PermissionRequest;
import com.eaut.backend.model.response.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse create(PermissionRequest request);

    List<PermissionResponse> getAllPermission();

    void delete(String permissionName);
}
