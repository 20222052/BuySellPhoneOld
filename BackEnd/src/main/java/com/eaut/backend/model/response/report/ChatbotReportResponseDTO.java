package com.eaut.backend.model.response.report;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotReportResponseDTO {

    private ChatbotSummaryDTO summary;
    private List<ChartDataDTO> chartData;
    private List<TopQuestionDTO> topQuestions;
    private List<RecentConversationDTO> recentConversations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatbotSummaryDTO {
        private long totalConversations;
        private long totalMessages;
        private String avgResponseTime;
        private int satisfactionRate;
    }
}
