package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserRole { admin("admin"), customer("customer"), staff("staff");
    private final String value;
}
