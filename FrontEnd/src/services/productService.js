import api from "./apiClient";

/**
 * Product Service - Quản lý sản phẩm (Product - entity cha của ProductItem)
 */
const ProductService = {
    /**
     * Lấy danh sách tất cả sản phẩm (có phân trang và lọc)
     * @param {Object} params - Tham số query
     * @param {string} params.search - Từ khóa tìm kiếm
     * @param {string} params.brandId - ID hãng
     * @param {string} params.categoryId - ID danh mục
     * @param {string} params.status - Trạng thái (active, inactive, draft)
     * @param {string} params.sort - Sắp xếp (ASC/DESC)
     * @param {number} params.page - Số trang (bắt đầu từ 0)
     * @param {number} params.pageSize - Số item mỗi trang
     * @returns {Promise} - Danh sách sản phẩm
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                brandId = '',
                categoryId = '',
                status = '',
                sort = 'DESC',
                page = 0,
                pageSize = 100
            } = params;

            const response = await api.get("/products", {
                params: {
                    search,
                    brand_id: brandId || undefined,
                    category_id: categoryId || undefined,
                    status: status || undefined,
                    sort,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách sản phẩm" };
        }
    },

    /**
     * Lấy thông tin chi tiết sản phẩm theo ID
     * @param {string} id - ID sản phẩm (UUID)
     * @returns {Promise} - Thông tin sản phẩm
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin sản phẩm" };
        }
    },

    /**
     * Tạo sản phẩm mới
     * @param {Object} data - Dữ liệu sản phẩm
     * @param {string} data.name - Tên sản phẩm
     * @param {string} data.description - Mô tả
     * @param {string} data.brandId - ID hãng
     * @param {string} data.categoryId - ID danh mục
     * @param {string} data.status - Trạng thái
     * @param {number} data.warrantyMonths - Số tháng bảo hành
     * @returns {Promise} - Sản phẩm đã tạo
     */
    create: async (data) => {
        try {
            const response = await api.post("/products", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo sản phẩm" };
        }
    },

    /**
     * Cập nhật sản phẩm
     * @param {string} id - ID sản phẩm (UUID)
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise} - Sản phẩm đã cập nhật
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/products/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật sản phẩm" };
        }
    },

    /**
     * Xóa sản phẩm
     * @param {string} id - ID sản phẩm (UUID)
     * @returns {Promise}
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa sản phẩm" };
        }
    }
};

export default ProductService;