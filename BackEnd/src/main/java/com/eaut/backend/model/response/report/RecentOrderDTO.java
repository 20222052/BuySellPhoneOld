package com.eaut.backend.model.response.report;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDTO {
    private String id;
    private String customer;
    private BigDecimal total;
    private String status;
    private String date; // YYYY-MM-DD
}
