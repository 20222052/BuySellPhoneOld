package com.eaut.backend.untils;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrderStatus { pending("pending"), paid("paid"), processing("processing"), shipped("shipped"), completed("completed"), cancelled("cancelled"), refunded("refunded");
    private final String value;
}
