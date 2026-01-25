package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductStatus {
    draft(0, "draft"),
    active(1, "active"),
    inactive(2, "inactive");

    private final Integer code;
    private final String value;

    public static ProductStatus fromCode(Integer code) {
        if (code == null)
            return draft;
        for (ProductStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return draft;
    }
}
