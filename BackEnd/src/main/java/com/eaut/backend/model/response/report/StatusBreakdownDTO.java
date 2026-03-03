package com.eaut.backend.model.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusBreakdownDTO {
    private String status;
    private String label;
    private long count;
    private double percentage;
}
