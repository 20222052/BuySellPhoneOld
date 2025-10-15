package com.eaut.backend.untils;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PaymentMethod { cod("cod"), bank("bank"), e_wallet("e_wallet"), card("card");
    private final String value;
}