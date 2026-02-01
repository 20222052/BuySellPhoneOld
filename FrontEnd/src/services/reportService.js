import api from "./apiClient";

/**
 * Report Service - Thống kê báo cáo
 * Mock data được sử dụng do chưa có backend API
 */
const ReportService = {
    /**
     * Thống kê đơn hàng
     */
    getOrderStats: async (fromDate, toDate) => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // const response = await api.get('/admin/reports/orders', { params: { fromDate, toDate } });
            // return response.data;

            // Mock data
            return {
                summary: {
                    totalOrders: 156,
                    completedOrders: 120,
                    pendingOrders: 25,
                    cancelledOrders: 11,
                    totalRevenue: 2850000000,
                    averageOrderValue: 18269230
                },
                chartData: [
                    { date: '2026-01-22', orders: 22, revenue: 450000000 },
                    { date: '2026-01-23', orders: 28, revenue: 520000000 },
                    { date: '2026-01-24', orders: 18, revenue: 380000000 },
                    { date: '2026-01-25', orders: 35, revenue: 680000000 },
                    { date: '2026-01-26', orders: 25, revenue: 420000000 },
                    { date: '2026-01-27', orders: 15, revenue: 250000000 },
                    { date: '2026-01-28', orders: 13, revenue: 150000000 }
                ],
                statusBreakdown: [
                    { status: 'completed', label: 'Hoàn thành', count: 120, percentage: 77 },
                    { status: 'pending', label: 'Chờ xử lý', count: 15, percentage: 9.6 },
                    { status: 'processing', label: 'Đang xử lý', count: 10, percentage: 6.4 },
                    { status: 'cancelled', label: 'Đã hủy', count: 11, percentage: 7 }
                ],
                recentOrders: [
                    { id: 'ORD001', customer: 'Nguyễn Văn A', total: 25000000, status: 'completed', date: '2026-01-28' },
                    { id: 'ORD002', customer: 'Trần Thị B', total: 18500000, status: 'processing', date: '2026-01-28' },
                    { id: 'ORD003', customer: 'Lê Văn C', total: 32000000, status: 'pending', date: '2026-01-27' },
                    { id: 'ORD004', customer: 'Phạm Thị D', total: 15000000, status: 'completed', date: '2026-01-27' },
                    { id: 'ORD005', customer: 'Hoàng Văn E', total: 28000000, status: 'cancelled', date: '2026-01-26' }
                ]
            };
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thống kê đơn hàng" };
        }
    },

    /**
     * Thống kê sản phẩm
     */
    getProductStats: async (fromDate, toDate) => {
        try {
            // TODO: Replace with actual API call when backend is ready

            // Mock data
            return {
                summary: {
                    totalProducts: 245,
                    activeProducts: 198,
                    outOfStock: 32,
                    discontinued: 15,
                    totalSold: 1250
                },
                topSelling: [
                    { id: 1, name: 'iPhone 15 Pro Max', sold: 85, revenue: 2550000000 },
                    { id: 2, name: 'Samsung Galaxy S24 Ultra', sold: 65, revenue: 1820000000 },
                    { id: 3, name: 'iPhone 14 Pro', sold: 52, revenue: 1248000000 },
                    { id: 4, name: 'Xiaomi 14 Ultra', sold: 48, revenue: 816000000 },
                    { id: 5, name: 'OPPO Find X7 Ultra', sold: 42, revenue: 756000000 }
                ],
                categoryBreakdown: [
                    { category: 'iPhone', count: 85, sold: 320, revenue: 9600000000 },
                    { category: 'Samsung', count: 65, sold: 280, revenue: 5040000000 },
                    { category: 'Xiaomi', count: 45, sold: 220, revenue: 2640000000 },
                    { category: 'OPPO', count: 30, sold: 180, revenue: 2160000000 },
                    { category: 'Khác', count: 20, sold: 250, revenue: 2500000000 }
                ],
                chartData: [
                    { date: '2026-01-22', sold: 45 },
                    { date: '2026-01-23', sold: 52 },
                    { date: '2026-01-24', sold: 38 },
                    { date: '2026-01-25', sold: 68 },
                    { date: '2026-01-26', sold: 55 },
                    { date: '2026-01-27', sold: 42 },
                    { date: '2026-01-28', sold: 30 }
                ]
            };
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thống kê sản phẩm" };
        }
    },

    /**
     * Thống kê chatbot
     */
    getChatbotStats: async (fromDate, toDate) => {
        try {
            // TODO: Replace with actual API call when backend is ready

            // Mock data
            return {
                summary: {
                    totalConversations: 856,
                    totalMessages: 4250,
                    avgResponseTime: '2.5s',
                    satisfactionRate: 92
                },
                chartData: [
                    { date: '2026-01-22', conversations: 120, messages: 580 },
                    { date: '2026-01-23', conversations: 135, messages: 650 },
                    { date: '2026-01-24', conversations: 98, messages: 480 },
                    { date: '2026-01-25', conversations: 156, messages: 720 },
                    { date: '2026-01-26', conversations: 142, messages: 680 },
                    { date: '2026-01-27', conversations: 115, messages: 560 },
                    { date: '2026-01-28', conversations: 90, messages: 580 }
                ],
                topQuestions: [
                    { question: 'Giá iPhone 15 Pro Max bao nhiêu?', count: 125 },
                    { question: 'Có hỗ trợ trả góp không?', count: 98 },
                    { question: 'Thời gian bảo hành bao lâu?', count: 85 },
                    { question: 'Cách đổi trả sản phẩm?', count: 72 },
                    { question: 'Giao hàng mất bao lâu?', count: 68 }
                ],
                recentConversations: [
                    { id: 'CHAT001', user: 'Nguyễn Văn A', messages: 8, duration: '5m 30s', date: '2026-01-28 14:30' },
                    { id: 'CHAT002', user: 'Khách vãng lai', messages: 5, duration: '3m 15s', date: '2026-01-28 14:15' },
                    { id: 'CHAT003', user: 'Trần Thị B', messages: 12, duration: '8m 45s', date: '2026-01-28 13:50' },
                    { id: 'CHAT004', user: 'Lê Văn C', messages: 6, duration: '4m 20s', date: '2026-01-28 13:30' },
                    { id: 'CHAT005', user: 'Khách vãng lai', messages: 4, duration: '2m 10s', date: '2026-01-28 13:00' }
                ]
            };
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thống kê chatbot" };
        }
    }
};

export default ReportService;
