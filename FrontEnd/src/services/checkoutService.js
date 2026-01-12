import api from "./apiClient";

/**
 * Checkout Service - Quản lý đặt hàng
 */
const CheckoutService = {
    /**
     * Tạo đơn hàng từ giỏ hàng
     * @param {Object} data
     * @param {UUID} data.userId - ID người dùng
     * @param {UUID} data.addressId - ID địa chỉ giao hàng
     * @param {string} data.paymentMethod - Phương thức thanh toán (cod, bank_transfer, etc)
     * @param {string} data.note - Ghi chú (optional)
     * @returns {Promise} - CheckoutResponse
     */
    checkout: async (data) => {
        try {
            const response = await api.post("/checkout", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo đơn hàng" };
        }
    },

    /**
     * Lấy chi tiết đơn hàng theo ID
     * @param {UUID} orderId - ID đơn hàng
     * @returns {Promise} - CheckoutResponse
     */
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/checkout/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải đơn hàng" };
        }
    },

    /**
     * Lấy danh sách đơn hàng của user
     * @param {UUID} userId - ID người dùng
     * @returns {Promise} - List<CheckoutResponse>
     */
    getOrdersByUserId: async (userId) => {
        try {
            const response = await api.get(`/checkout/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách đơn hàng" };
        }
    },

    /**
     * Format giá tiền VND
     */
    formatPrice: (price) => {
        if (!price) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }
};

export default CheckoutService;
