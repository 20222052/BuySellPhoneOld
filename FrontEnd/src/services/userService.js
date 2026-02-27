import api from "./apiClient";

/**
 * User Service - Quản lý người dùng
 */
const UserService = {
    /**
     * Lấy danh sách tất cả users (có phân trang, chỉ admin)
     * @param {Object} params - Tham số query
     * @param {string} params.search - Từ khóa tìm kiếm
     * @param {string} params.sort - Sắp xếp (ASC/DESC)
     * @param {string} params.role - Lọc theo role
     * @param {string} params.permission - Lọc theo permission
     * @param {string} params.status - Lọc theo trạng thái (active/inactive)
     * @param {number} params.page - Số trang (bắt đầu từ 0)
     * @param {number} params.pageSize - Số item mỗi trang
     * @returns {Promise} - Danh sách users
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                sort = 'DESC',
                role = '',
                permission = '',
                status = '',
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/users", {
                params: {
                    search,
                    sort,
                    role,
                    permission,
                    status,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách người dùng" };
        }
    },

    /**
     * Lấy thông tin chi tiết user theo ID
     * @param {string} id - ID user (UUID)
     * @returns {Promise} - Thông tin user
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin người dùng" };
        }
    },

    /**
     * Cập nhật user
     * @param {string} id - ID user (UUID)
     * @param {Object} userData - Dữ liệu cập nhật
     * @returns {Promise} - User sau khi cập nhật
     */
    update: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật thông tin người dùng" };
        }
    },

    /**
     * Lấy thông tin user hiện tại đang đăng nhập
     * @returns {Promise} - Thông tin user
     */
    getMyInfo: async () => {
        try {
            const response = await api.get("/users/myinfo");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin tài khoản" };
        }
    },

    /**
     * Khóa tài khoản user (chuyển status thành inactive)
     * @param {string} id - ID user (UUID)
     * @returns {Promise} - User sau khi cập nhật
     */
    lockUser: async (id) => {
        try {
            const response = await api.patch(`/users/${id}/status`, { status: 'inactive' });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể khóa tài khoản" };
        }
    },

    /**
     * Mở khóa tài khoản user (chuyển status thành active)
     * @param {string} id - ID user (UUID)
     * @returns {Promise} - User sau khi cập nhật
     */
    unlockUser: async (id) => {
        try {
            const response = await api.patch(`/users/${id}/status`, { status: 'active' });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể mở khóa tài khoản" };
        }
    },

    /**
     * Toggle trạng thái khóa/mở khóa tài khoản
     * @param {string} id - ID user (UUID)
     * @param {string} currentStatus - Trạng thái hiện tại ('active' hoặc 'inactive')
     * @returns {Promise} - User sau khi cập nhật
     */
    toggleStatus: async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const response = await api.patch(`/users/${id}/status`, { status: newStatus });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể thay đổi trạng thái tài khoản" };
        }
    },

    /**
     * Tìm kiếm users (sử dụng getAll với search param)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @returns {Promise} - Danh sách users phù hợp
     */
    search: async (keyword) => {
        try {
            const response = await api.get("/users", {
                params: {
                    search: keyword,
                    page: 0,
                    page_size: 100
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tìm kiếm người dùng" };
        }
    },

    /**
     * Đổi mật khẩu tài khoản
     * @param {string} userId - ID user (UUID)
     * @param {Object} data - { oldPassword, newPassword, confirmPassword }
     * @returns {Promise}
     */
    changePassword: async (userId, data) => {
        try {
            const response = await api.patch(`/users/${userId}/password`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể đổi mật khẩu" };
        }
    }
};

export default UserService;
