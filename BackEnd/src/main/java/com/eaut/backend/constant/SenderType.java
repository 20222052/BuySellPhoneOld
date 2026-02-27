package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SenderType {
    USER("user"), BOT("bot"), AGENT("agent"), SYSTEM("system");

    private final String value;
}
