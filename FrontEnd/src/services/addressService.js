import api from "./apiClient";

/**
 * Address Service - Quản lý địa chỉ người dùng
 */
const AddressService = {
    /**
     * Tạo địa chỉ mới
     * @param {Object} data
     * @param {UUID} data.userId - ID người dùng
     * @param {string} data.fullName - Họ tên
     * @param {string} data.phone - Số điện thoại
     * @param {string} data.addressLine - Địa chỉ chi tiết
     * @param {string} data.cityCode - Mã tỉnh/thành
     * @param {string} data.districtCode - Mã quận/huyện
     * @param {string} data.wardCode - Mã xã/phường
     * @param {boolean} data.isDefault - Địa chỉ mặc định
     * @returns {Promise} - AddressResponse
     */
    createAddress: async (data) => {
        try {
            const response = await api.post("/addresses", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo địa chỉ" };
        }
    },

    /**
     * Lấy địa chỉ theo ID
     * @param {UUID} addressId - ID địa chỉ
     * @returns {Promise} - AddressResponse
     */
    getAddressById: async (addressId) => {
        try {
            const response = await api.get(`/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải địa chỉ" };
        }
    },

    /**
     * Lấy tất cả địa chỉ của user
     * @param {UUID} userId - ID người dùng
     * @returns {Promise} - List<AddressResponse>
     */
    getAddressesByUserId: async (userId) => {
        try {
            const response = await api.get(`/addresses/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách địa chỉ" };
        }
    },

    /**
     * Lấy địa chỉ mặc định của user
     * @param {UUID} userId - ID người dùng
     * @returns {Promise} - AddressResponse
     */
    getDefaultAddress: async (userId) => {
        try {
            const response = await api.get(`/addresses/user/${userId}/default`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải địa chỉ mặc định" };
        }
    },

    /**
     * Cập nhật địa chỉ
     * @param {UUID} addressId - ID địa chỉ
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise} - AddressResponse
     */
    updateAddress: async (addressId, data) => {
        try {
            const response = await api.put(`/addresses/${addressId}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật địa chỉ" };
        }
    },

    /**
     * Xóa địa chỉ
     * @param {UUID} addressId - ID địa chỉ
     * @returns {Promise}
     */
    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa địa chỉ" };
        }
    },

    /**
     * Đặt địa chỉ mặc định
     * @param {UUID} userId - ID người dùng
     * @param {UUID} addressId - ID địa chỉ
     * @returns {Promise} - AddressResponse
     */
    setDefaultAddress: async (userId, addressId) => {
        try {
            const response = await api.put(`/addresses/user/${userId}/default/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể đặt địa chỉ mặc định" };
        }
    }
};

export default AddressService;
