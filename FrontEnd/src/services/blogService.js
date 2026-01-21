import api from "./apiClient";

/**
 * Blog Service - Quản lý bài viết/tin tức
 */
const BlogService = {
    /**
     * Lấy danh sách tất cả blogs (có phân trang và tìm kiếm)
     * @param {Object} params - Tham số query
     * @param {string} params.search - Từ khóa tìm kiếm
     * @param {string} params.sort - Sắp xếp (ASC/DESC)
     * @param {number} params.page - Số trang (bắt đầu từ 0)
     * @param {number} params.pageSize - Số item mỗi trang
     * @returns {Promise} - Danh sách blogs
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                sort = 'DESC',
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/blogs", {
                params: {
                    search,
                    sort,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách bài viết" };
        }
    },

    /**
     * Lấy thông tin chi tiết blog theo ID (tự động tăng view count)
     * @param {string} id - ID blog (UUID)
     * @returns {Promise} - Thông tin blog
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/blogs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin bài viết" };
        }
    },

    /**
     * Tạo blog mới (yêu cầu đăng nhập)
     * @param {Object} data - Dữ liệu blog
     * @param {string} data.title - Tiêu đề
     * @param {string} data.content - Nội dung
     * @param {string} data.imageUrl - URL ảnh
     * @param {string} data.author - Tên tác giả
     * @returns {Promise} - Blog đã tạo
     */
    create: async (data) => {
        try {
            const response = await api.post("/blogs", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo bài viết" };
        }
    },

    /**
     * Cập nhật blog (yêu cầu đăng nhập)
     * @param {string} id - ID blog (UUID)
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise} - Blog đã cập nhật
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/blogs/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật bài viết" };
        }
    },

    /**
     * Xóa blog (yêu cầu đăng nhập)
     * @param {string} id - ID blog (UUID)
     * @returns {Promise}
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/blogs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa bài viết" };
        }
    },

    /**
     * Lấy danh sách blogs của user đang đăng nhập
     * @param {Object} params - Tham số query  
     * @returns {Promise} - Danh sách blogs
     */
    getMyBlogs: async (params = {}) => {
        try {
            const {
                sort = 'DESC',
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/blogs/my-blogs", {
                params: {
                    sort,
                    page,
                    page_size: pageSize
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách bài viết của bạn" };
        }
    }
};

export default BlogService;
