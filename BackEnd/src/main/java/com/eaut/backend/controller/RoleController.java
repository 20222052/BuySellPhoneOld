package com.eaut.backend.controller;


import com.eaut.backend.model.request.RoleRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.RoleResponse;
import com.eaut.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/role")
public class RoleController {
    final RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .data(roleService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .data(roleService.getAllRole())
                .build();
    }

    @DeleteMapping("/{roleName}")
    ApiResponse<Void> delete(@PathVariable String roleName) {
        roleService.delete(roleName);
        return ApiResponse.<Void>builder().build();
    }
}
