package com.eaut.backend.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserBankUpdateRequest {
    private String bankName;
    private String accountName;
    private String bankAccount;
}
