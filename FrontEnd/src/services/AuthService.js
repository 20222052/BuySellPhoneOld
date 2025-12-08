import api from "./apiClient";

// Auth Service
const AuthService = {
    // Đăng nhập
    login: async (credentials) => {
        try {
            const response = await api.post("/auth/login", credentials);
            if (response.data.accessToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Đăng nhập thất bại" };
        }
    },

    // Đăng ký
    register: async (userData) => {
        try {
            const response = await api.post("/auth/register", userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Đăng ký thất bại" };
        }
    },

    // Đăng xuất
    logout: async () => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
        } catch (error) {
            // Still remove tokens even if API call fails
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            throw error;
        }
    },

    // Quên mật khẩu - Gửi OTP
    forgotPassword: async (email) => {
        try {
            const response = await api.post("/auth/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Gửi OTP thất bại" };
        }
    },

    // Xác thực OTP
    verifyOTP: async (email, otp) => {
        try {
            const response = await api.post("/auth/verify-otp", { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Xác thực OTP thất bại" };
        }
    },

    // Đặt lại mật khẩu
    resetPassword: async (email, otp, newPassword) => {
        try {
            const response = await api.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Đặt lại mật khẩu thất bại" };
        }
    },

    // Refresh token
    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await api.post("/auth/refresh-token", { refreshToken });
            if (response.data.accessToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
            }
            return response.data;
        } catch (error) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            throw error;
        }
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: async () => {
        try {
            const response = await api.get("/auth/me");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Lấy thông tin user thất bại" };
        }
    },

    // Kiểm tra token còn hợp lệ không
    isAuthenticated: () => {
        const token = localStorage.getItem("accessToken");
        return !!token;
    },

    // Lấy user từ localStorage
    getStoredUser: () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
};

export default AuthService;