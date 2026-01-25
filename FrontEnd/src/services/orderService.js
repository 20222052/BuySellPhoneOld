import api from "./apiClient";

const OrderService = {
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                status = '',
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                order = 'desc'
            } = params;

            // Updated to /orders instead of /api/orders because apiClient already includes baseURL (likely /api)
            // or if we updated backend to /orders then this should be just /orders relative to baseURL
            const response = await api.get("/orders", {
                params: {
                    search,
                    status,
                    page,
                    limit,
                    sortBy,
                    order
                }
            });
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
    }
};

export default OrderService;
