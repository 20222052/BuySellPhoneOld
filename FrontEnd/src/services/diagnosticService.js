import apiClient from "./apiClient";

const diagnosticService = {
    /**
     * Gửi yêu cầu thẩm định điện thoại (Ảnh + Checklist)
     * @param {FormData} formData - Chứa 'files' (ảnh) và 'data' (JSON check list)
     * @returns {Promise<Object>} - Kết quả thẩm định
     */
    analyzeDiagnostic: async (formData) => {
        try {
            const response = await apiClient.post("/diagnostics/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 300000, // 5 minutes (override default 10s)
            });
            return response.data;
        } catch (error) {
            console.error("Error analyzing diagnostic:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Lấy kết quả thẩm định theo ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    getDiagnosticById: async (id) => {
        try {
            const response = await apiClient.get(`/diagnostics/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Lấy lịch sử thẩm định của user hiện tại
     * @returns {Promise<Array>}
     */
    getMyHistory: async () => {
        try {
            const response = await apiClient.get("/diagnostics/user/my-history");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ===================== ADMIN METHODS =====================

    /**
     * Lấy tất cả yêu cầu trade-in cho admin
     * @param {Object} params - { page, size, status, sortBy, sortDir }
     * @returns {Promise<Object>} - Paginated result
     */
    getAllForAdmin: async (params = {}) => {
        try {
            const response = await apiClient.get("/diagnostics/admin/all", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Cập nhật trạng thái yêu cầu trade-in
     * @param {string} id - Diagnostic ID
     * @param {string} status - pending | tested | cancelled
     */
    updateStatus: async (id, status) => {
        try {
            const response = await apiClient.put(`/diagnostics/admin/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default diagnosticService;

