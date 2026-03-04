import apiClient from "./apiClient";

/**
 * Format date to ISO OffsetDateTime start of day
 */
const formatFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
};

/**
 * Format date to ISO OffsetDateTime end of day
 */
const formatToDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
};

/**
 * Report Service - Thống kê báo cáo
 */
const ReportService = {
    /**
     * Thống kê đơn hàng
     */
    getOrderStats: async (fromDate, toDate) => {
        try {
            const formattedFromDate = formatFromDate(fromDate);
            const formattedToDate = formatToDate(toDate);

            const response = await apiClient.get('/admin/reports/orders', {
                params: {
                    fromDate: formattedFromDate,
                    toDate: formattedToDate
                }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy báo cáo đơn hàng", error);
            throw error.response?.data || { message: "Không thể tải thống kê đơn hàng" };
        }
    },

    /**
     * Thống kê sản phẩm
     */
    getProductStats: async (fromDate, toDate) => {
        try {
            const formattedFromDate = formatFromDate(fromDate);
            const formattedToDate = formatToDate(toDate);

            const response = await apiClient.get('/admin/reports/products', {
                params: {
                    fromDate: formattedFromDate,
                    toDate: formattedToDate
                }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy báo cáo sản phẩm", error);
            throw error.response?.data || { message: "Không thể tải thống kê sản phẩm" };
        }
    },

    /**
     * Thống kê chatbot
     */
    getChatbotStats: async (fromDate, toDate) => {
        try {
            const formattedFromDate = formatFromDate(fromDate);
            const formattedToDate = formatToDate(toDate);

            const response = await apiClient.get('/admin/reports/chatbot', {
                params: {
                    fromDate: formattedFromDate,
                    toDate: formattedToDate
                }
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy báo cáo chatbot", error);
            throw error.response?.data || { message: "Không thể tải thống kê chatbot" };
        }
    }
};

export default ReportService;
