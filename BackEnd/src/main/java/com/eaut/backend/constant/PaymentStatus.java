package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PaymentStatus { unpaid("unpaid"), paid("paid"), refunded("refunded");
    private final String value;
}