package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Gender { male("male"), female("female"), other("other");
    private final String value;
}