package com.eaut.backend.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTradeInRequest {
    @NotNull(message = "isTradeIn is required")
    private Integer isTradeIn;
}
