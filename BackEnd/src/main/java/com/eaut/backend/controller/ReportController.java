package com.eaut.backend.controller;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eaut.backend.model.response.report.ChatbotReportResponseDTO;
import com.eaut.backend.model.response.report.OrderReportResponseDTO;
import com.eaut.backend.model.response.report.ProductReportResponseDTO;
import com.eaut.backend.service.ReportService;

@RestController
@RequestMapping("/admin/reports")
@org.springframework.security.access.prepost.PreAuthorize("permitAll()")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/orders")
    public ResponseEntity<OrderReportResponseDTO> getOrderStats(
            @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate) {
        OrderReportResponseDTO response = reportService.getOrderStats(fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products")
    public ResponseEntity<ProductReportResponseDTO> getProductStats(
            @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate) {
        ProductReportResponseDTO response = reportService.getProductStats(fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chatbot")
    public ResponseEntity<ChatbotReportResponseDTO> getChatbotStats(
            @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate) {
        ChatbotReportResponseDTO response = reportService.getChatbotStats(fromDate, toDate);
        return ResponseEntity.ok(response);
    }
}
