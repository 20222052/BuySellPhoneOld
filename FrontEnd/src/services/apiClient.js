import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000,
});

export default apiClient;
