package com.eaut.backend.Service.impl;

import com.eaut.backend.Entity.Permission;
import com.eaut.backend.Model.Request.PermissionRequest;
import com.eaut.backend.Model.Response.PermissionResponse;
import com.eaut.backend.Repository.PermissionRepository;
import com.eaut.backend.Service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {

    final PermissionRepository permissionRepository;


    @Override
    public PermissionResponse create(PermissionRequest request) {
        Permission permission = Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Permission savedPermission = permissionRepository.save(permission);
        return PermissionResponse .builder()
                .name(savedPermission.getName())
                .description(savedPermission.getDescription())
                .build();
    }

    @Override
    public List<PermissionResponse> getAllPermission() {
        List<Permission> permissions = permissionRepository.findAll();
        List<PermissionResponse> permissionResponseList = new ArrayList<>();
        permissions.forEach(permission -> {
            PermissionResponse permissionResponse = PermissionResponse.builder()
                    .name(permission.getName())
                    .description(permission.getDescription())
                    .build();
            permissionResponseList.add(permissionResponse);
        });
        return permissionResponseList;
    }

    @Override
    public void delete(String permissionName) {
        permissionRepository.deleteById(permissionName);
    }
}
