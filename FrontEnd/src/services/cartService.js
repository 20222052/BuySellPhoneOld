import api from "./apiClient";

/**
 * Cart Service - Quản lý giỏ hàng
 */
const CartService = {
    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {Object} data
     * @param {UUID} data.userId - ID người dùng
     * @param {UUID} data.productColorId - ID màu sản phẩm
     * @param {number} data.quantity - Số lượng
     * @returns {Promise} - CartResponse
     */
    addToCart: async (data) => {
        try {
            const response = await api.post("/carts/add", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể thêm vào giỏ hàng" };
        }
    },

    /**
     * Lấy giỏ hàng theo userId
     * @param {UUID} userId - ID người dùng
     * @returns {Promise} - List<CartResponse>
     */
    getCartByUserId: async (userId) => {
        try {
            const response = await api.get(`/carts/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải giỏ hàng" };
        }
    },

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * Nếu quantity <= 0, sản phẩm sẽ bị xóa khỏi giỏ hàng
     * @param {UUID} cartItemId - ID item trong giỏ hàng
     * @param {number} quantity - Số lượng mới
     * @returns {Promise} - CartResponse hoặc null nếu đã xóa
     */
    updateCartItem: async (cartItemId, quantity) => {
        try {
            const response = await api.put(`/carts/${cartItemId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật giỏ hàng" };
        }
    },

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * @param {UUID} cartItemId - ID item trong giỏ hàng
     * @returns {Promise}
     */
    deleteCartItem: async (cartItemId) => {
        try {
            const response = await api.delete(`/carts/${cartItemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa sản phẩm khỏi giỏ hàng" };
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

export default CartService;
