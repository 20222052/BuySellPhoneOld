package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum DiagnosticStatus { pending("pending"), tested("tested"), cancelled("cancelled");
    private final String value;
}