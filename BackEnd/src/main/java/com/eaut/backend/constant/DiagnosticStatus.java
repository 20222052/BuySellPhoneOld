package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum DiagnosticStatus {
    pending("pending"), tested("tested"), processing("processing"), completed("completed"), cancelled("cancelled");

    private final String value;
}
