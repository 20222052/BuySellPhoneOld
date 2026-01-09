import api from "./apiClient";

/**
 * Category Service - Quản lý danh mục sản phẩm
 */
const CategoryService = {
    /**
     * Lấy danh sách tất cả danh mục (có phân trang)
     * @param {Object} params - Tham số query
     * @param {string} params.search - Từ khóa tìm kiếm
     * @param {string} params.sort - Sắp xếp (ASC/DESC)
     * @param {string} params.isActive - Trạng thái active
     * @param {number} params.page - Số trang (bắt đầu từ 0)
     * @param {number} params.pageSize - Số item mỗi trang
     * @returns {Promise} - Danh sách danh mục
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                sort = 'DESC',
                isActive = '',
                page = 0,
                pageSize = 100 // Lấy nhiều để hiển thị tất cả
            } = params;

            const response = await api.get("/categories", {
                params: {
                    search,
                    sort,
                    isActive,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách danh mục" };
        }
    },

    /**
     * Lấy thông tin chi tiết danh mục theo ID
     * @param {number|string} id - ID danh mục
     * @returns {Promise} - Thông tin danh mục
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin danh mục" };
        }
    },

    /**
     * Tạo danh mục mới
     * @param {Object} categoryData - Dữ liệu danh mục { name, description }
     * @returns {Promise} - Danh mục vừa tạo
     */
    create: async (categoryData) => {
        try {
            const response = await api.post("/categories", categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo danh mục" };
        }
    },

    /**
     * Cập nhật danh mục
     * @param {number|string} id - ID danh mục
     * @param {Object} categoryData - Dữ liệu cập nhật { name, description }
     * @returns {Promise} - Danh mục sau khi cập nhật
     */
    update: async (id, categoryData) => {
        try {
            const response = await api.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật danh mục" };
        }
    },

    /**
     * Xóa danh mục
     * @param {string} id - ID danh mục (UUID)
     * @returns {Promise} - Kết quả xóa
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/categories?id=${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa danh mục" };
        }
    },

    /**
     * Tìm kiếm danh mục (sử dụng getAll với search param)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @returns {Promise} - Danh sách danh mục phù hợp
     */
    search: async (keyword) => {
        try {
            const response = await api.get("/categories", {
                params: {
                    search: keyword,
                    page: 0,
                    page_size: 100
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tìm kiếm danh mục" };
        }
    }
};

export default CategoryService;
