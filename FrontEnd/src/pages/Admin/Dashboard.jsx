import { StatCard, ChartCard, ProgressCircle, DataTable, TableBadge, TableAvatar } from '../../components/common/Admin';
import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getStatistics();
      if (response && response.data) {
        // Map API response fields to state
        setStats({
          totalCustomers: response.data.newCustomersToday || 0,
          totalOrders: response.data.newOrdersToday || 0,
          totalProducts: response.data.soldProductsToday || 0,
          totalRevenue: response.data.revenueToday || 0,
          recentOrders: response.data.recentOrders || []
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for the bar chart
  const monthlyData = [
    { month: 'Jan', value: 180 },
    { month: 'Feb', value: 220 },
    { month: 'Mar', value: 350 },
    { month: 'Apr', value: 280 },
    { month: 'May', value: 240 },
    { month: 'Jun', value: 190 },
    { month: 'Jul', value: 210 },
    { month: 'Aug', value: 170 },
    { month: 'Sep', value: 250 },
    { month: 'Oct', value: 380 },
    { month: 'Nov', value: 290 },
    { month: 'Dec', value: 150 },
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  const columns = [
    { key: 'code', label: 'Mã đơn', width: '100px' },
    {
      key: 'user',
      label: 'Khách hàng',
      render: (value) => (
        <TableAvatar src={value?.avatarUrl} name={value?.fullName} subtitle={value?.email} />
      ),
    },
    {
      key: 'items',
      label: 'Sản phẩm',
      render: (items) => {
        if (!items || items.length === 0) return 'N/A';
        return items.length === 1
          ? items[0].productName
          : `${items[0].productName} +${items.length - 1}`;
      }
    },
    {
      key: 'total',
      label: 'Tổng tiền',
      render: (value) => (
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => {
        const statusMap = {
          completed: { label: 'Hoàn thành', variant: 'success' },
          pending: { label: 'Chờ xử lý', variant: 'warning' },
          processing: { label: 'Đang xử lý', variant: 'primary' },
          cancelled: { label: 'Đã hủy', variant: 'danger' },
          shipped: { label: 'Đang giao', variant: 'info' },
          refunded: { label: 'Đã hoàn tiền', variant: 'secondary' },
          paid: { label: 'Đã thanh toán', variant: 'success' }
        };
        const status = statusMap[value] || { label: value, variant: 'secondary' };
        return <TableBadge variant={status.variant}>{status.label}</TableBadge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày đặt',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header mb-24">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="admin-row cols-4 mb-24 stagger-animation">
        <StatCard
          title="Tổng khách hàng"
          value={stats.totalCustomers}
          isPositive={true}
          icon="bi-people-fill"
          variant="primary"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          isPositive={true}
          icon="bi-box-seam-fill"
          variant="success"
        />
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          isPositive={true}
          icon="bi-phone-fill"
          variant="warning"
        />
        <StatCard
          title="Tổng doanh thu"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
          isPositive={true}
          icon="bi-currency-dollar"
          variant="danger"
        />
      </div>

      {/* Recent Orders */}
      <DataTable
        title="Đơn hàng hôm nay"
        columns={columns}
        data={stats.recentOrders}
      />
    </div>
  );
}
