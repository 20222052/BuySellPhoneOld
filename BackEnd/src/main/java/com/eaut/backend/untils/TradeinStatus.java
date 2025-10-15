package com.eaut.backend.untils;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TradeinStatus { pending("pending"), inspecting("inspecting"), quoted("quoted"), accepted("accepted"), rejected("rejected"), cancelled("cancelled"), completed("completed");
    private final String value;
}