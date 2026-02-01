import { useState, useEffect } from 'react';
import { StatCard } from '../../../components/common/Admin';
import ReportService from '../../../services/reportService';

export default function ProductsReport({ fromDate, toDate, filterTrigger, onDataLoad }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [fromDate, toDate, filterTrigger]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await ReportService.getProductStats(fromDate, toDate);
            setData(result);
            onDataLoad?.(result);
        } catch (error) {
            console.error('Fetch product stats error:', error);
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

    if (loading) {
        return (
            <div className="report-loading">
                <div className="report-loading-spinner"></div>
            </div>
        );
    }

    if (!data) return null;

    const maxSold = Math.max(...data.chartData.map(d => d.sold));

    return (
        <>
            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard
                    title="Tổng sản phẩm"
                    value={data.summary.totalProducts}
                    icon="bi-phone-fill"
                    variant="primary"
                />
                <StatCard
                    title="Đang bán"
                    value={data.summary.activeProducts}
                    icon="bi-check-circle-fill"
                    variant="success"
                />
                <StatCard
                    title="Hết hàng"
                    value={data.summary.outOfStock}
                    icon="bi-exclamation-circle-fill"
                    variant="warning"
                />
                <StatCard
                    title="Đã bán"
                    value={data.summary.totalSold}
                    icon="bi-bag-check-fill"
                    variant="info"
                />
            </div>

            {/* Chart & Top Selling */}
            <div className="report-grid">
                {/* Bar Chart */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Sản phẩm bán theo ngày</h3>
                    </div>
                    <div className="chart-wrapper">
                        <div className="simple-bar-chart">
                            {data.chartData.map((item, index) => (
                                <div key={index} className="bar-item">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(item.sold / maxSold) * 200}px`,
                                            background: 'linear-gradient(180deg, #10b981, #059669)'
                                        }}
                                    >
                                        <span className="bar-value">{item.sold}</span>
                                    </div>
                                    <span className="bar-label">
                                        {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="report-chart-card">
                    <div className="report-chart-header">
                        <h3 className="report-chart-title">Top sản phẩm bán chạy</h3>
                    </div>
                    <div className="top-list">
                        {data.topSelling.map((product, index) => (
                            <div key={index} className="top-list-item">
                                <div className={`top-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                                    {index + 1}
                                </div>
                                <div className="top-info">
                                    <div className="top-name">{product.name}</div>
                                    <div className="top-stats">Đã bán: {product.sold}</div>
                                </div>
                                <div className="top-value">{formatCurrency(product.revenue)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="report-table-card">
                <div className="report-table-header">
                    <h3 className="report-table-title">Thống kê theo danh mục</h3>
                </div>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Danh mục</th>
                            <th>Số sản phẩm</th>
                            <th>Đã bán</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.categoryBreakdown.map((cat, index) => (
                            <tr key={index}>
                                <td><strong>{cat.category}</strong></td>
                                <td>{cat.count}</td>
                                <td>{cat.sold}</td>
                                <td>{formatCurrency(cat.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
