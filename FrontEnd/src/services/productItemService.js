import api from "./apiClient";
import axios from "axios";

/**
 * ProductItem Service - Quản lý sản phẩm chi tiết
 */
const ProductItemService = {
    /**
     * Upload ảnh lên Cloudinary thông qua backend
     * @param {File} file - File ảnh cần upload
     * @param {UUID} productItemId - ID của ProductItem
     * @param {boolean} isPrimary - Có phải ảnh chính không
     * @returns {Promise} - Kết quả upload
     */
    uploadMedia: async (file, productItemId, isPrimary = false) => {
        try {
            const formData = new FormData();
            formData.append('files', file);
            formData.append('productItemId', productItemId);
            formData.append('hexCode', '#000000');
            formData.append('isPrimary', isPrimary);

            const token = localStorage.getItem("accessToken");
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "/api"}/product-medias/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể upload ảnh" };
        }
    },

    /**
     * Upload nhiều ảnh cùng lúc (trước khi tạo ProductItem)
     * Trả về danh sách URL sau khi upload lên Cloudinary
     */
    uploadMultipleMedia: async (files) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const token = localStorage.getItem("accessToken");
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "/api"}/upload/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể upload ảnh" };
        }
    },
    /**
     * Lấy danh sách ProductItems (cơ bản)
     */
    getAll: async (params = {}) => {
        try {
            const {
                search = '',
                productId = '',
                minPrice = '',
                maxPrice = '',
                sort = 'DESC',
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/product-items", {
                params: {
                    search,
                    product_id: productId || undefined,
                    min_price: minPrice || undefined,
                    max_price: maxPrice || undefined,
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
     * Lấy danh sách ProductItems với đầy đủ thông tin hiển thị
     * Bao gồm: brand, category, ảnh, rating, discount
     */
    getAllForList: async (params = {}) => {
        try {
            const {
                search = '',
                productId = '',
                brandId = '',
                categoryId = '',
                status = '',
                minPrice = '',
                maxPrice = '',
                sortBy = 'createdAt',
                sortDir = 'DESC',
                randomEnabled = true,
                page = 0,
                pageSize = 10
            } = params;

            const response = await api.get("/product-items/list", {
                params: {
                    search,
                    product_id: productId || undefined,
                    brand_id: brandId || undefined,
                    category_id: categoryId || undefined,
                    status: status || undefined,
                    min_price: minPrice || undefined,
                    max_price: maxPrice || undefined,
                    sort_by: sortBy,
                    sort_dir: sortDir,
                    random_enabled: randomEnabled,
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
     * Lấy thông tin chi tiết ProductItem theo ID
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/product-items/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải thông tin sản phẩm" };
        }
    },

    /**
     * Lấy thông tin chi tiết đầy đủ ProductItem (bao gồm models, colors, media, ratings)
     */
    getDetails: async (id) => {
        try {
            const response = await api.get(`/product-items/${id}/details`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải chi tiết sản phẩm" };
        }
    },

    /**
     * Tạo ProductItem mới (có thể kèm models, colors, media)
     * @param {Object} data
     * @param {UUID} data.productId - ID sản phẩm cha
     * @param {number} data.basePrice - Giá gốc
     * @param {number} data.sellPrice - Giá bán
     * @param {number} data.comparePrice - Giá so sánh
     * @param {Array} data.models - Danh sách models (mỗi model có thể chứa colors với qtyAvailable)
     * @param {Array} data.mediaList - Danh sách media
     */
    create: async (data) => {
        try {
            const response = await api.post("/product-items", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tạo sản phẩm" };
        }
    },

    /**
     * Cập nhật ProductItem (có thể kèm models, colors, media)
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/product-items/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật sản phẩm" };
        }
    },

    /**
     * Cập nhật trạng thái ProductItem
     * @param {UUID} id - ID của ProductItem
     * @param {string} status - Trạng thái mới (active, inactive, discontinued)
     */
    updateStatus: async (id, status) => {
        try {
            const response = await api.patch(`/product-items/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể cập nhật trạng thái" };
        }
    },

    /**
     * Xóa ProductItem
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/product-items/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể xóa sản phẩm" };
        }
    },

    /**
     * Format giá tiền VND
     */
    formatPrice: (price) => {
        if (!price) return '0 đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    },

    /**
     * Tính phần trăm giảm giá
     */
    calculateDiscount: (comparePrice, sellPrice) => {
        if (!comparePrice || !sellPrice || comparePrice <= 0 || comparePrice <= sellPrice) {
            return 0;
        }
        return Math.round(((comparePrice - sellPrice) / comparePrice) * 100);
    }
};

export default ProductItemService;
