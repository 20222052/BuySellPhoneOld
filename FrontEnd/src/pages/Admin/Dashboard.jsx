import { StatCard, ChartCard, ProgressCircle, DataTable, TableBadge, TableAvatar } from '../../components/common/Admin';

export default function Dashboard() {
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

  // Sample orders data
  const recentOrders = [
    {
      id: '#ORD-001',
      customer: { name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', avatar: null },
      product: 'iPhone 13 Pro Max',
      amount: '25.500.000đ',
      status: 'completed',
      date: '05/01/2026',
    },
    {
      id: '#ORD-002',
      customer: { name: 'Trần Thị B', email: 'tranthib@email.com', avatar: null },
      product: 'Samsung Galaxy S23',
      amount: '18.900.000đ',
      status: 'pending',
      date: '05/01/2026',
    },
    {
      id: '#ORD-003',
      customer: { name: 'Lê Văn C', email: 'levanc@email.com', avatar: null },
      product: 'iPhone 14 Plus',
      amount: '22.000.000đ',
      status: 'processing',
      date: '04/01/2026',
    },
    {
      id: '#ORD-004',
      customer: { name: 'Phạm Thị D', email: 'phamthid@email.com', avatar: null },
      product: 'Xiaomi 13 Pro',
      amount: '15.500.000đ',
      status: 'cancelled',
      date: '04/01/2026',
    },
  ];

  const columns = [
    { key: 'id', label: 'Mã đơn', width: '100px' },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (value) => (
        <TableAvatar src={value.avatar} name={value.name} subtitle={value.email} />
      ),
    },
    { key: 'product', label: 'Sản phẩm' },
    { key: 'amount', label: 'Tổng tiền' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => {
        const statusMap = {
          completed: { label: 'Hoàn thành', variant: 'success' },
          pending: { label: 'Chờ xử lý', variant: 'warning' },
          processing: { label: 'Đang xử lý', variant: 'primary' },
          cancelled: { label: 'Đã hủy', variant: 'danger' },
        };
        const status = statusMap[value] || { label: value, variant: 'secondary' };
        return <TableBadge variant={status.variant}>{status.label}</TableBadge>;
      },
    },
    { key: 'date', label: 'Ngày đặt' },
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header mb-24">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Chào mừng trở lại! Đây là tổng quan cửa hàng của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-row cols-4 mb-24 stagger-animation">
        <StatCard
          title="Khách hàng"
          value="3,782"
          change="11.01%"
          isPositive={true}
          icon="bi-people-fill"
          variant="primary"
        />
        <StatCard
          title="Đơn hàng"
          value="5,359"
          change="9.05%"
          isPositive={false}
          icon="bi-box-seam-fill"
          variant="success"
        />
        <StatCard
          title="Sản phẩm"
          value="892"
          change="5.25%"
          isPositive={true}
          icon="bi-phone-fill"
          variant="warning"
        />
        <StatCard
          title="Doanh thu"
          value="₫2.5B"
          change="15.3%"
          isPositive={true}
          icon="bi-currency-dollar"
          variant="danger"
        />
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-24">
        <div className="col-lg-8">
          <ChartCard
            title="Doanh số hàng tháng"
            subtitle="Thống kê doanh số theo từng tháng"
            filters={[]}
          >
            <div className="simple-bar-chart">
              {monthlyData.map((item, idx) => (
                <div key={idx} className="bar-item">
                  <div
                    className="bar"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  >
                    <span className="bar-tooltip">{item.value}</span>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="col-lg-4">
          <div className="target-card animate-fade-in-up">
            <div className="target-card-header">
              <div>
                <h3 className="target-card-title">Mục tiêu tháng</h3>
                <p className="target-card-subtitle">Mục tiêu bạn đã đặt cho tháng này</p>
              </div>
              <button className="stat-card-menu">
                <i className="bi bi-three-dots-vertical"></i>
              </button>
            </div>

            <ProgressCircle value={75.55} label="" />

            <div className="target-change">
              <i className="bi bi-arrow-up"></i>
              +10%
            </div>

            <p className="target-message">
              Bạn đã đạt <strong>₫3.287.000.000</strong> hôm nay, cao hơn tháng trước. Tiếp tục phát huy!
            </p>

            <div className="target-stats">
              <div className="target-stat-item">
                <p className="target-stat-label">Mục tiêu</p>
                <p className="target-stat-value down">
                  ₫20B <i className="bi bi-arrow-down"></i>
                </p>
              </div>
              <div className="target-stat-item">
                <p className="target-stat-label">Doanh thu</p>
                <p className="target-stat-value up">
                  ₫20B <i className="bi bi-arrow-up"></i>
                </p>
              </div>
              <div className="target-stat-item">
                <p className="target-stat-label">Hôm nay</p>
                <p className="target-stat-value up">
                  ₫20B <i className="bi bi-arrow-up"></i>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <DataTable
        title="Đơn hàng gần đây"
        columns={columns}
        data={recentOrders}
        actions={
          <button className="admin-btn admin-btn-primary">
            <i className="bi bi-plus-lg"></i>
            Thêm đơn hàng
          </button>
        }
      />
    </div>
  );
}