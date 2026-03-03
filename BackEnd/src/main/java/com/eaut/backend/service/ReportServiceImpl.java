package com.eaut.backend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.eaut.backend.model.response.report.ChatbotReportResponseDTO;
import com.eaut.backend.model.response.report.OrderReportResponseDTO;
import com.eaut.backend.model.response.report.ProductReportResponseDTO;
import com.eaut.backend.repository.ChatMessageRepository;
import com.eaut.backend.repository.ConversationRepository;
import com.eaut.backend.repository.OrderItemRepository;
import com.eaut.backend.repository.OrderRepository;
import com.eaut.backend.repository.ProductItemRepository;
import com.eaut.backend.repository.ProductRepository;
import com.eaut.backend.constant.OrderStatus;
import com.eaut.backend.model.response.report.ChartDataDTO;
import com.eaut.backend.model.response.report.StatusBreakdownDTO;
import java.math.BigDecimal;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public OrderReportResponseDTO getOrderStats(OffsetDateTime fromDate, OffsetDateTime toDate) {
        log.info("Generating order stats from {} to {}", fromDate, toDate);
        OrderReportResponseDTO response = new OrderReportResponseDTO();
        
        long totalOrders = orderRepository.countOrdersByDateRange(fromDate, toDate);
        long completedOrders = orderRepository.countOrdersByDateRangeAndStatus(fromDate, toDate, OrderStatus.completed);
        long pendingOrders = orderRepository.countOrdersByDateRangeAndStatus(fromDate, toDate, OrderStatus.pending);
        long cancelledOrders = orderRepository.countOrdersByDateRangeAndStatus(fromDate, toDate, OrderStatus.cancelled);
        
        BigDecimal totalRevenue = orderRepository.sumCompletedRevenueByDateRange(fromDate, toDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        BigDecimal avgValue = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(completedOrders > 0 ? completedOrders : 1), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        OrderReportResponseDTO.OrderSummaryDTO summary = OrderReportResponseDTO.OrderSummaryDTO.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .pendingOrders(pendingOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgValue)
                .build();
        response.setSummary(summary);
        
        // Chart Data
        List<java.util.Map<String, Object>> dailyStats = orderRepository.getDailyOrderStats(fromDate, toDate);
        List<ChartDataDTO> chartData = new ArrayList<>();
        for (java.util.Map<String, Object> stat : dailyStats) {
            String dateStr = String.valueOf(stat.get("date"));
            Long count = ((Number) stat.get("count")).longValue();
            BigDecimal rev = (BigDecimal) stat.get("revenue");
            chartData.add(ChartDataDTO.builder().date(dateStr).orders(count).revenue(rev).build());
        }
        response.setChartData(chartData);
        
        // Status Breakdown
        List<StatusBreakdownDTO> breakdown = new ArrayList<>();
        breakdown.add(StatusBreakdownDTO.builder().status("completed").label("Hoàn thành").count(completedOrders).percentage(totalOrders > 0 ? (completedOrders * 100.0 / totalOrders) : 0).build());
        breakdown.add(StatusBreakdownDTO.builder().status("pending").label("Chờ xử lý").count(pendingOrders).percentage(totalOrders > 0 ? (pendingOrders * 100.0 / totalOrders) : 0).build());
        // Handle other statuses mapping to "processing" if needed, simplified here
        long processingOrders = totalOrders - completedOrders - pendingOrders - cancelledOrders;
        breakdown.add(StatusBreakdownDTO.builder().status("processing").label("Đang xử lý").count(Math.max(0, processingOrders)).percentage(totalOrders > 0 ? (Math.max(0, processingOrders) * 100.0 / totalOrders) : 0).build());
        breakdown.add(StatusBreakdownDTO.builder().status("cancelled").label("Đã hủy").count(cancelledOrders).percentage(totalOrders > 0 ? (cancelledOrders * 100.0 / totalOrders) : 0).build());
        response.setStatusBreakdown(breakdown);
        
        // Recent Orders
        List<com.eaut.backend.entities.Order> recentEntities = orderRepository.findRecentOrdersByDateRange(fromDate, toDate, org.springframework.data.domain.PageRequest.of(0, 5));
        List<com.eaut.backend.model.response.report.RecentOrderDTO> recentOrders = new ArrayList<>();
        for (com.eaut.backend.entities.Order o : recentEntities) {
            recentOrders.add(com.eaut.backend.model.response.report.RecentOrderDTO.builder()
                    .id(o.getCode())
                    .customer(o.getUser() != null ? o.getUser().getFullName() : o.getSnapshotShippingFullName())
                    .total(o.getTotal())
                    .status(o.getStatus().name())
                    .date(o.getCreatedAt().toLocalDate().toString())
                    .build());
        }
        response.setRecentOrders(recentOrders);
        
        return response;
    }

    @Override
    public ProductReportResponseDTO getProductStats(OffsetDateTime fromDate, OffsetDateTime toDate) {
        log.info("Generating product stats from {} to {}", fromDate, toDate);
        ProductReportResponseDTO response = new ProductReportResponseDTO();
        
        long totalProducts = productRepository.countTotalProducts();
        long activeProducts = productRepository.countProductsByStatus(com.eaut.backend.constant.ProductStatus.active);
        long outOfStockProducts = productRepository.countProductsByStatus(com.eaut.backend.constant.ProductStatus.inactive); // Or customized logic
        long discontinuedProducts = 0; // Customize if you have this state
        
        Long totalSold = orderItemRepository.sumTotalSoldProductsByDateRange(fromDate, toDate);
        if (totalSold == null) totalSold = 0L;
        
        ProductReportResponseDTO.ProductSummaryDTO summary = ProductReportResponseDTO.ProductSummaryDTO.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .outOfStock(outOfStockProducts)
                .discontinued(discontinuedProducts)
                .totalSold(totalSold)
                .build();
        response.setSummary(summary);
        
        // Chart Data
        List<java.util.Map<String, Object>> dailyStats = orderItemRepository.getDailySoldProductsStats(fromDate, toDate);
        List<com.eaut.backend.model.response.report.ChartDataDTO> chartData = new ArrayList<>();
        for (java.util.Map<String, Object> stat : dailyStats) {
            String dateStr = String.valueOf(stat.get("date"));
            Long sold = ((Number) stat.get("sold")).longValue();
            chartData.add(com.eaut.backend.model.response.report.ChartDataDTO.builder().date(dateStr).sold(sold).build());
        }
        response.setChartData(chartData);
        
        // Top Selling
        List<java.util.Map<String, Object>> topSellingList = orderItemRepository.getTopSellingProducts(fromDate, toDate, org.springframework.data.domain.PageRequest.of(0, 5));
        List<com.eaut.backend.model.response.report.TopSellingProductDTO> topSelling = new ArrayList<>();
        for (java.util.Map<String, Object> stat : topSellingList) {
            topSelling.add(com.eaut.backend.model.response.report.TopSellingProductDTO.builder()
                    .id(String.valueOf(stat.get("id")))
                    .name((String) stat.get("name"))
                    .sold(((Number) stat.get("sold")).longValue())
                    .revenue((java.math.BigDecimal) stat.get("revenue"))
                    .build());
        }
        response.setTopSelling(topSelling);
        
        // Category Breakdown
        List<java.util.Map<String, Object>> categoryList = orderItemRepository.getCategoryBreakdown(fromDate, toDate);
        List<com.eaut.backend.model.response.report.CategoryBreakdownDTO> categoryBreakdown = new ArrayList<>();
        for (java.util.Map<String, Object> stat : categoryList) {
            categoryBreakdown.add(com.eaut.backend.model.response.report.CategoryBreakdownDTO.builder()
                    .category((String) stat.get("category"))
                    .count(((Number) stat.get("count")).longValue())
                    .sold(((Number) stat.get("sold")).longValue())
                    .revenue((java.math.BigDecimal) stat.get("revenue"))
                    .build());
        }
        response.setCategoryBreakdown(categoryBreakdown);
        
        return response;
    }

    @Override
    public ChatbotReportResponseDTO getChatbotStats(OffsetDateTime fromDate, OffsetDateTime toDate) {
        log.info("Generating chatbot stats from {} to {}", fromDate, toDate);
        ChatbotReportResponseDTO response = new ChatbotReportResponseDTO();
        
        long totalConversations = conversationRepository.countConversationsByDateRange(fromDate, toDate);
        long totalMessages = chatMessageRepository.countMessagesByDateRange(fromDate, toDate);
        
        // Mocking average response time and satisfaction rate for now as it requires complex parsing or AI analysis over message timestamps
        String avgResponseTime = "2.5s";
        int satisfactionRate = 92;
        
        ChatbotReportResponseDTO.ChatbotSummaryDTO summary = ChatbotReportResponseDTO.ChatbotSummaryDTO.builder()
                .totalConversations(totalConversations)
                .totalMessages(totalMessages)
                .avgResponseTime(avgResponseTime)
                .satisfactionRate(satisfactionRate)
                .build();
        response.setSummary(summary);
        
        // Chart Data (Combine daily conversations and messages)
        List<java.util.Map<String, Object>> dailyConvStats = conversationRepository.getDailyConversationStats(fromDate, toDate);
        List<java.util.Map<String, Object>> dailyMsgStats = chatMessageRepository.getDailyMessageStats(fromDate, toDate);
        
        java.util.Map<String, ChartDataDTO> chartDataMap = new java.util.HashMap<>();
        
        for (java.util.Map<String, Object> stat : dailyConvStats) {
            String dateStr = String.valueOf(stat.get("date"));
            Long convCount = ((Number) stat.get("conversations")).longValue();
            chartDataMap.put(dateStr, ChartDataDTO.builder().date(dateStr).conversations(convCount).messages(0L).build());
        }
        
        for (java.util.Map<String, Object> stat : dailyMsgStats) {
            String dateStr = String.valueOf(stat.get("date"));
            Long msgCount = ((Number) stat.get("messages")).longValue();
            ChartDataDTO dto = chartDataMap.getOrDefault(dateStr, ChartDataDTO.builder().date(dateStr).conversations(0L).messages(0L).build());
            dto.setMessages(msgCount);
            chartDataMap.put(dateStr, dto);
        }
        
        List<ChartDataDTO> chartData = new ArrayList<>(chartDataMap.values());
        chartData.sort(java.util.Comparator.comparing(ChartDataDTO::getDate));
        response.setChartData(chartData);
        
        // Top Questions (Mocked for now as it requires NLP clustering normally)
        List<com.eaut.backend.model.response.report.TopQuestionDTO> topQuestions = new ArrayList<>();
        topQuestions.add(com.eaut.backend.model.response.report.TopQuestionDTO.builder().question("Giá iPhone 15 Pro Max bao nhiêu?").count(125).build());
        topQuestions.add(com.eaut.backend.model.response.report.TopQuestionDTO.builder().question("Có hỗ trợ trả góp không?").count(98).build());
        topQuestions.add(com.eaut.backend.model.response.report.TopQuestionDTO.builder().question("Thời gian bảo hành bao lâu?").count(85).build());
        response.setTopQuestions(topQuestions);
        
        // Recent Conversations
        List<com.eaut.backend.entities.Conversation> recentEntities = conversationRepository.findRecentConversationsByDateRange(fromDate, toDate, org.springframework.data.domain.PageRequest.of(0, 5));
        List<com.eaut.backend.model.response.report.RecentConversationDTO> recentConversations = new ArrayList<>();
        
        for (com.eaut.backend.entities.Conversation c : recentEntities) {
            recentConversations.add(com.eaut.backend.model.response.report.RecentConversationDTO.builder()
                    .id(c.getId().toString().substring(0, 8).toUpperCase())
                    .user("Khách hàng") // In production would map to authenticated user if existing
                    .messages(c.getMessages() != null ? c.getMessages().size() : 0)
                    .duration("Xm Ys") // Mocked duration
                    .date(c.getCreatedAt().toLocalDate().toString() + " " + String.format("%02d:%02d", c.getCreatedAt().getHour(), c.getCreatedAt().getMinute()))
                    .build());
        }
        response.setRecentConversations(recentConversations);
        
        return response;
    }
}
