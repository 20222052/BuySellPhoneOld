package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GradeEnum { A("A"), B("B"), C("C"), D("D");
    private final String value;
}