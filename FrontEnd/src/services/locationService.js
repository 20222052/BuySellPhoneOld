import api from "./apiClient";

/**
 * Location Service - Quản lý tỉnh/thành, quận/huyện, xã/phường
 */
const LocationService = {
    /**
     * Lấy danh sách 64 tỉnh/thành
     * @returns {Promise}
     */
    getProvinces: async () => {
        try {
            const response = await fetch("https://production.cas.so/address-kit/2025-07-01/provinces");
            return await response.json();
        } catch (error) {
            throw { message: "Không thể tải danh sách tỉnh/thành" };
        }
    },

    /**
     * Lấy danh sách xã/phường theo mã tỉnh (bỏ qua quận/huyện)
     * @param {string} provinceCode - Mã tỉnh
     * @returns {Promise}
     */
    getCommunesByProvince: async (provinceCode) => {
        try {
            const response = await fetch(`https://production.cas.so/address-kit/2025-07-01/provinces/${provinceCode}/communes`);
            return await response.json();
        } catch (error) {
            throw { message: "Không thể tải danh sách xã/phường" };
        }
    }
};

export default LocationService;
