import api from "./apiClient";

const OrderService = {
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                status = '',
                paymentMethod = '',
                fromDate = '',
                toDate = '',
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                order = 'desc'
            } = params;

            // Chỉ gửi các param có giá trị (tránh gửi string rỗng lên backend)
            const queryParams = { page, limit, sortBy, order };
            if (search) queryParams.search = search;
            if (status) queryParams.status = status;
            if (paymentMethod) queryParams.paymentMethod = paymentMethod;
            if (fromDate) queryParams.fromDate = fromDate;
            if (toDate) queryParams.toDate = toDate;

            const response = await api.get("/orders", { params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách đơn hàng" };
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải chi tiết đơn hàng" };
        }
    },

    updateStatus: async (id, status) => {
        try {
            const response = await api.put(`/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật trạng thái đơn hàng" };
        }
    },

    cancelOrder: async (id, reason) => {
        try {
            const response = await api.put(`/orders/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể hủy đơn hàng" };
        }
    }
};

export default OrderService;
