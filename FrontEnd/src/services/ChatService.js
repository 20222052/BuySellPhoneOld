import api, { publicApiClient } from "./apiClient";

/**
 * Chat Service - Quản lý Chat & WebSocket Support
 */
const ChatService = {
    // === API cho Admin ===

    /**
     * Lấy danh sách hàng đợi
     */
    getQueue: async () => {
        try {
            const response = await api.get("/chat/queue");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể lấy hàng đợi" };
        }
    },

    /**
     * Admin pick user từ hàng đợi
     */
    pickUser: async () => {
        try {
            const response = await api.post("/chat/queue/pick");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể chọn user" };
        }
    },

    /**
     * Kết thúc hỗ trợ cho session
     */
    endSession: async (sessionId) => {
        try {
            const response = await api.post(`/chat/queue/end/${sessionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Lỗi kết thúc phiên" };
        }
    },

    /**
     * Lấy lịch sử chat của 1 session
     */
    getHistory: async (sessionId) => {
        try {
            const response = await api.get(`/chat/history/${sessionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải lịch sử chat" };
        }
    },

    /**
     * Lấy toàn bộ danh sách hội thoại (Cho Admin xem lịch sử)
     */
    getAllHistory: async () => {
        try {
            const response = await api.get("/chat/history/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách hội thoại" };
        }
    },

    // === API Test / Utils ===

    ingestProduct: async (productItemId) => {
        try {
            const response = await api.post(`/chat/ingest/${productItemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Ingest thất bại" };
        }
    }
};

export default ChatService;
