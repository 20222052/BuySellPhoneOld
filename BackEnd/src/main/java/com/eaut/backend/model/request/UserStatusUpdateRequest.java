package com.eaut.backend.model.request;

import com.eaut.backend.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusUpdateRequest {
    private UserStatus status;
}
