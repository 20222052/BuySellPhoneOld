import api from "./apiClient";

/**
 * Brand Service - Quản lý hãng sản xuất
 */
const BrandService = {
    /**
     * Lấy danh sách tất cả hãng (có phân trang)
     * @param {Object} params - Tham số query
     * @param {string} params.search - Từ khóa tìm kiếm
     * @param {string} params.sort - Sắp xếp (ASC/DESC)
     * @param {number} params.page - Số trang (bắt đầu từ 0)
     * @param {number} params.pageSize - Số item mỗi trang
     * @returns {Promise} - Danh sách hãng
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                sort = 'DESC',
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/brands", {
                params: {
                    search,
                    sort,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách hãng sản xuất" };
        }
    },

    /**
     * Lấy thông tin chi tiết hãng theo ID
     * @param {string} id - ID hãng (UUID)
     * @returns {Promise} - Thông tin hãng
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/brands/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin hãng sản xuất" };
        }
    },

    /**
     * Tạo hãng mới
     * @param {Object} brandData - Dữ liệu hãng { name, description, logo, ... }
     * @returns {Promise} - Hãng vừa tạo
     */
    create: async (brandData) => {
        try {
            const response = await api.post("/brands", brandData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo hãng sản xuất" };
        }
    },

    /**
     * Tạo hãng mới với upload logo
     * @param {string} name - Tên hãng
     * @param {File|null} logoFile - File logo (optional)
     * @returns {Promise} - Hãng vừa tạo
     */
    createWithLogo: async (name, logoFile = null) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await api.post("/brands/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo hãng sản xuất" };
        }
    },

    /**
     * Cập nhật hãng
     * @param {string} id - ID hãng (UUID)
     * @param {Object} brandData - Dữ liệu cập nhật { name, description, logo, ... }
     * @returns {Promise} - Hãng sau khi cập nhật
     */
    update: async (id, brandData) => {
        try {
            const response = await api.put(`/brands/${id}`, brandData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật hãng sản xuất" };
        }
    },

    /**
     * Cập nhật hãng với upload logo mới
     * @param {string} id - ID hãng (UUID)
     * @param {string|null} name - Tên mới (optional)
     * @param {File|null} logoFile - File logo mới (optional)
     * @returns {Promise} - Hãng sau khi cập nhật
     */
    updateWithLogo: async (id, name = null, logoFile = null) => {
        try {
            const formData = new FormData();
            if (name) {
                formData.append('name', name);
            }
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await api.put(`/brands/${id}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật hãng sản xuất" };
        }
    },

    /**
     * Xóa hãng
     * @param {string} id - ID hãng (UUID)
     * @returns {Promise} - Kết quả xóa
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/brands?id=${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa hãng sản xuất" };
        }
    },

    /**
     * Tìm kiếm hãng (sử dụng getAll với search param)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @returns {Promise} - Danh sách hãng phù hợp
     */
    search: async (keyword) => {
        try {
            const response = await api.get("/brands", {
                params: {
                    search: keyword,
                    page: 0,
                    page_size: 100
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tìm kiếm hãng sản xuất" };
        }
    }
};

export default BrandService;
