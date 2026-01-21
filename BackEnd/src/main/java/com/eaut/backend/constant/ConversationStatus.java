package com.eaut.backend.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

// Enum: BOT_ACTIVE (Bot đang chat), PENDING_HUMAN (Chờ nhân viên), HUMAN_ACTIVE (Nhân viên đang chat), CLOSED
@Getter
@AllArgsConstructor
public enum ConversationStatus { BOT_ACTIVE("Bot đang chat"), PENDING_HUMAN("Chờ nhân viên"), HUMAN_ACTIVE("Nhân viên đang chat"), CLOSED("Đã đóng");
    private final String value;
}