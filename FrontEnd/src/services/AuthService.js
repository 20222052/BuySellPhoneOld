import api from "./apiClient";
import { getRoleFromToken, isTokenExpired, isAdmin } from "../utils/jwtHelper";

// Auth Service
const AuthService = {
    // Đăng nhập
    login: async (credentials) => {
        try {
            const response = await api.post("/auth/login", credentials);
            const result = response.data;

            // Kiểm tra response theo cấu trúc từ backend
            if (result.code === 200 && result.data?.authenticated) {
                const { token, data: userData } = result.data;

                // Lưu token vào localStorage
                localStorage.setItem("accessToken", token);

                // Lấy role từ token hoặc từ user data
                const roleFromToken = getRoleFromToken(token);
                const userRoles = userData?.roles?.map(r => r.name) || [];

                // Tạo user object để lưu
                const user = {
                    id: userData.id,
                    fullName: userData.fullName,
                    email: userData.email,
                    phone: userData.phone,
                    roles: userRoles,
                    role: roleFromToken || userRoles[0] || 'user',
                    avatarUrl: userData.avatarUrl,
                    createdAt: userData.createdAt,
                    modifiedAt: userData.modifiedAt
                };

                localStorage.setItem("user", JSON.stringify(user));

                return {
                    success: true,
                    token,
                    user,
                    isAdmin: isAdmin(token)
                };
            }

            throw { message: "Đăng nhập thất bại" };
        } catch (error) {
            throw error.response?.data || error || { message: "Đăng nhập thất bại" };
        }
    },

    // Đăng ký
    register: async (userData) => {
        try {
            const response = await api.post("/users/register", userData);
            console.log("Register response:", response);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Đăng ký thất bại" };
        }
    },

    // Đăng xuất
    logout: async () => {
        try {
            // Gọi API logout sử dụng api client (đã có interceptor thêm token)
            await api.get("/auth/logout");
        } catch (error) {
            // Dù API lỗi vẫn logout ở client
            console.warn("Logout API failed, clearing local storage anyway", error);
        } finally {
            // Luôn luôn xóa localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
        }
    },


    // Quên mật khẩu - Gửi OTP
    forgotPassword: async (email, password) => {
        try {
            const response = await api.post("/auth/forgot-password", { email, password });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Gửi OTP thất bại" };
        }
    },

    // Quên mật khẩu - Xác thực OTP
    forgotPasswordConfirmOTP: async (email, otp) => {
        try {
            const response = await api.post("/auth/forgot-password-confirm-otp", { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Xác thực OTP thất bại" };
        }
    },

    // Xác thực OTP
    verifyOTP: async (email, otp) => {
        try {
            const response = await api.post("/auth/confirm-otp", { email, otp });
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
            const response = await api.get("/users/myinfo");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Lấy thông tin user thất bại" };
        }
    },

    // Kiểm tra token còn hợp lệ không
    isAuthenticated: () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return false;

        // Kiểm tra token đã hết hạn chưa
        if (isTokenExpired(token)) {
            // Token hết hạn, xóa khỏi localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            return false;
        }

        return true;
    },

    // Lấy user từ localStorage
    getStoredUser: () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    // Lấy role của user hiện tại
    getCurrentRole: () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        return getRoleFromToken(token);
    },

    // Kiểm tra user hiện tại có phải admin không
    isCurrentUserAdmin: () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return false;
        return isAdmin(token);
    },

    // Kiểm tra user có role cụ thể không
    hasRole: (role) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return false;
        const currentRole = getRoleFromToken(token);
        if (Array.isArray(role)) {
            return role.includes(currentRole);
        }
        return currentRole === role;
    },
};

export default AuthService;