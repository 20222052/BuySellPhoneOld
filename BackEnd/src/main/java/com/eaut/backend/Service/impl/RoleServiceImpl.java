package com.eaut.backend.Service.impl;

import com.eaut.backend.Entity.Permission;
import com.eaut.backend.Entity.Role;
import com.eaut.backend.Model.Request.RoleRequest;
import com.eaut.backend.Model.Response.PermissionResponse;
import com.eaut.backend.Model.Response.RoleResponse;
import com.eaut.backend.Repository.PermissionRepository;
import com.eaut.backend.Repository.RoleRepository;
import com.eaut.backend.Service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {
    final RoleRepository roleRepository;
    final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        var permission = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permission));

        Role savedRole = roleRepository.save(role);
        return RoleResponse.builder()
                .name(savedRole.getName())
                .description(savedRole.getDescription())
                .permissions(savedRole.getPermissions())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRole() {
        List<Role> roles = roleRepository.findAll();
        List<RoleResponse> roleResponseList = new ArrayList<>();
        roles.forEach(permission -> {
            RoleResponse roleResponse = RoleResponse.builder()
                    .name(permission.getName())
                    .description(permission.getDescription())
                    .permissions(permission.getPermissions())
                    .build();
            roleResponseList.add(roleResponse);
        });
        return roleResponseList;
    }

    @Override
    public void delete(String roleName) {
        roleRepository.deleteById(roleName);
    }
}
