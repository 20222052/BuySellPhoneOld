package com.eaut.backend.service;

import java.time.OffsetDateTime;

import com.eaut.backend.model.response.report.ChatbotReportResponseDTO;
import com.eaut.backend.model.response.report.OrderReportResponseDTO;
import com.eaut.backend.model.response.report.ProductReportResponseDTO;

public interface ReportService {
    OrderReportResponseDTO getOrderStats(OffsetDateTime fromDate, OffsetDateTime toDate);
    ProductReportResponseDTO getProductStats(OffsetDateTime fromDate, OffsetDateTime toDate);
    ChatbotReportResponseDTO getChatbotStats(OffsetDateTime fromDate, OffsetDateTime toDate);
}
