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
public class ChartDataDTO {
    private String date; // YYYY-MM-DD
    
    // For Orders
    private Long orders;
    private BigDecimal revenue;
    
    // For Products
    private Long sold;

    // For Chatbot
    private Long conversations;
    private Long messages;
}
