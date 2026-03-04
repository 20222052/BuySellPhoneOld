package com.eaut.backend.model.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentConversationDTO {
    private String id;
    private String user;
    private int messages;
    private String duration;
    private String date;
}
