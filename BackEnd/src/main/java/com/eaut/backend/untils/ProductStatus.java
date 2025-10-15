package com.eaut.backend.untils;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductStatus { active("active"), inactive("inactive"), discontinued("discontinued");
    private final String value;
}
