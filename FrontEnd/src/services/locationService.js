import api from "./apiClient";

/**
 * Location Service - Quản lý tỉnh/thành, quận/huyện, xã/phường
 */
const LocationService = {
    /**
     * Lấy danh sách 64 tỉnh/thành
     * @returns {Promise} - List<Province>
     */
    getProvinces: async () => {
        try {
            const response = await api.get("/locations/provinces");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách tỉnh/thành" };
        }
    },

    /**
     * Lấy danh sách quận/huyện theo mã tỉnh
     * @param {string} provinceCode - Mã tỉnh
     * @returns {Promise} - List<District>
     */
    getDistrictsByProvince: async (provinceCode) => {
        try {
            const response = await api.get(`/locations/provinces/${provinceCode}/districts`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách quận/huyện" };
        }
    },

    /**
     * Lấy danh sách xã/phường theo mã quận/huyện
     * @param {string} districtCode - Mã quận/huyện
     * @returns {Promise} - List<Commune>
     */
    getWardsByDistrict: async (districtCode) => {
        try {
            const response = await api.get(`/locations/districts/${districtCode}/wards`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Không thể tải danh sách xã/phường" };
        }
    }
};

export default LocationService;
