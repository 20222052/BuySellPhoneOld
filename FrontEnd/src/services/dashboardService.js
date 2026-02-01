import axios from './apiClient';

const dashboardService = {
    getStatistics: () => {
        return axios.get('/admin/dashboard/statistics');
    },
};

export default dashboardService;
