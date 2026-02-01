package com.eaut.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardUserResponse {
    private String fullName;
    private String email;
    private String avatarUrl;
}
