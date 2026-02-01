import { useState, useEffect } from 'react';
import { StatCard } from '../../../components/common/Admin';
import ReportService from '../../../services/reportService';

export default function OrdersReport({ fromDate, toDate, filterTrigger, onDataLoad }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate, filterTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await ReportService.getOrderStats(fromDate, toDate);
            setData(result);
            onDataLoad?.(result);
        } catch (error) {
            console.error('Fetch order stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    };

    const getStatusLabel = (status) => {
        const labels = {
            completed: 'Hoàn thành',
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="report-loading">
                <div className="report-loading-spinner"></div>
            </div>
        );
    }

    if (!data) return null;

    const maxOrders = Math.max(...data.chartData.map(d => d.orders));

    return (
        <>
            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard
                    title="Tổng đơn hàng"
                    value={data.summary.totalOrders}
                    icon="bi-box-seam-fill"
                    variant="primary"
                />
                <StatCard
                    title="Đơn hoàn thành"
                    value={data.summary.completedOrders}
                    icon="bi-check-circle-fill"
                    variant="success"
                />
                <StatCard
                    title="Đơn đã hủy"
                    value={data.summary.cancelledOrders}
                    icon="bi-x-circle-fill"
                    variant="danger"
                />
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(data.summary.totalRevenue)}
                    icon="bi-currency-dollar"
                    variant="warning"
                />
            </div>

            {/* Chart & Status Breakdown */}
            <div className="report-grid">
                {/* Bar Chart */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Đơn hàng theo ngày</h3>
                    </div>
                    <div className="chart-wrapper">
                        <div className="simple-bar-chart">
                            {data.chartData.map((item, index) => (
                                <div key={index} className="bar-item">
                                    <div
                                        className="bar"
                                        style={{ height: `${(item.orders / maxOrders) * 200}px` }}
                                    >
                                        <span className="bar-value">{item.orders}</span>
                                    </div>
                                    <span className="bar-label">
                                        {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Phân loại trạng thái</h3>
                    </div>
                    <div className="status-breakdown">
                        {data.statusBreakdown.map((item, index) => (
                            <div key={index} className="status-item">
                                <div className={`status-dot ${item.status}`}></div>
                                <div className="status-info">
                                    <div className="status-label">{item.label}</div>
                                    <div className="status-value">{item.count}</div>
                                </div>
                                <div className="status-percent">{item.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="report-table-card">
                <div className="report-table-header">
                    <h3 className="report-table-title">Đơn hàng gần đây</h3>
                </div>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày đặt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentOrders.map((order, index) => (
                            <tr key={index}>
                                <td><strong>{order.id}</strong></td>
                                <td>{order.customer}</td>
                                <td>{formatCurrency(order.total)}</td>
                                <td>
                                    <span className={`report-status-badge ${order.status}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
