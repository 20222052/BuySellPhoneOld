/**
 * JWT Helper - Các hàm tiện ích để xử lý JWT token
 */

/**
 * Decode JWT token để lấy payload
 * @param {string} token - JWT token
 * @returns {object|null} - Payload của token hoặc null nếu không hợp lệ
 */
export const decodeToken = (token) => {
    try {
        if (!token) return null;

        // JWT có 3 phần: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Decode phần payload (base64)
        const payload = parts[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Kiểm tra token đã hết hạn chưa
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token hết hạn hoặc không hợp lệ
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        // exp là timestamp tính bằng giây
        const expirationTime = decoded.exp * 1000; // Chuyển sang milliseconds
        const currentTime = Date.now();

        return currentTime >= expirationTime;
    } catch (error) {
        return true;
    }
};

/**
 * Lấy role từ token
 * @param {string} token - JWT token
 * @returns {string|null} - Role của user hoặc null
 */
export const getRoleFromToken = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.scope) return null;

        // scope có format "ROLE_admin" hoặc "ROLE_user"
        const scope = decoded.scope;
        if (scope.startsWith('ROLE_')) {
            return scope.replace('ROLE_', '');
        }
        return scope;
    } catch (error) {
        return null;
    }
};

/**
 * Lấy user ID từ token
 * @param {string} token - JWT token
 * @returns {string|null} - User ID hoặc null
 */
export const getUserIdFromToken = (token) => {
    try {
        const decoded = decodeToken(token);
        return decoded?.id || null;
    } catch (error) {
        return null;
    }
};

/**
 * Lấy email từ token
 * @param {string} token - JWT token
 * @returns {string|null} - Email hoặc null
 */
export const getEmailFromToken = (token) => {
    try {
        const decoded = decodeToken(token);
        return decoded?.sub || null;
    } catch (error) {
        return null;
    }
};

/**
 * Kiểm tra user có phải admin không
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu là admin
 */
export const isAdmin = (token) => {
    const role = getRoleFromToken(token);
    return role === 'admin';
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {string} token - JWT token
 * @param {string|string[]} roles - Role hoặc mảng các role cần kiểm tra
 * @returns {boolean} - true nếu user có một trong các role
 */
export const hasRole = (token, roles) => {
    const userRole = getRoleFromToken(token);
    if (!userRole) return false;

    if (Array.isArray(roles)) {
        return roles.includes(userRole);
    }
    return userRole === roles;
};
