import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import OrderService from '../../../services/orderService';
import '../../../assets/css/admin/categories.css';
import '../../../assets/css/admin/orders.css';
import OrderDetailModal from './OrderDetailModal';

export default function OrderList() {
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('createdAt');
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [paymentFilter, setPaymentFilter] = useState(searchParams.get('payment') || '');
    const [fromDate, setFromDate] = useState(searchParams.get('from') || '');
    const [toDate, setToDate] = useState(searchParams.get('to') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync filters khi URL thay đổi (ví dụ: click sidebar)
    useEffect(() => {
        const statusFromUrl = searchParams.get('status') || '';
        const paymentFromUrl = searchParams.get('payment') || '';
        const fromFromUrl = searchParams.get('from') || '';
        const toFromUrl = searchParams.get('to') || '';
        setStatusFilter(statusFromUrl);
        setPaymentFilter(paymentFromUrl);
        setFromDate(fromFromUrl);
        setToDate(toFromUrl);
        setCurrentPage(1);
    }, [searchParams]);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await OrderService.getAll({
                search: debouncedSearch,
                status: statusFilter,
                paymentMethod: paymentFilter,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: currentPage,
                limit: pageSize,
                sortBy: sortBy,
                order: sortOrder
            });
            const data = response?.data || {};
            setOrders(data.items || []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalElements || 0);
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error(error.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortOrder, sortBy, statusFilter, paymentFilter, fromDate, toDate, currentPage, pageSize]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle View Detail
    const handleViewDetail = async (orderId) => {
        try {
            const response = await OrderService.getById(orderId);
            if (response.code === 200) {
                setSelectedOrder(response.data);
                setShowDetailModal(true);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Không thể tải chi tiết đơn hàng");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const columns = [
        {
            key: 'code',
            label: 'Mã đơn hàng',
            render: (value) => <span className="order-code">#{value}</span>
        },
        {
            key: 'customerName',
            label: 'Khách hàng',
            render: (value) => <span className="fw-medium">{value}</span>
        },
        {
            key: 'total',
            label: 'Tổng tiền',
            render: (value) => <span className="total-price">{formatPrice(value)}</span>
        },
        {
            key: 'paymentMethod',
            label: 'Thanh toán',
            render: (value) => <span className="payment-method">{value}</span>
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => (
                <span className={`status-badge status-${value?.toLowerCase()}`}>{value}</span>
            )
        },
        {
            key: 'createdAt',
            label: 'Ngày đặt',
            render: (value) => <span className="order-date">{new Date(value).toLocaleDateString('vi-VN')}</span>
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-action btn-view"
                        onClick={() => handleViewDetail(row.id)}
                        title="Xem chi tiết"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="categories-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <i className="bi bi-cart3"></i>
                            Quản lý đơn hàng
                        </h1>
                    </div>
                    <div className="page-header-right">
                        {/* Nút toggle filter (chỉ visible trên mobile) */}
                        <button
                            className={`btn-refresh filter-toggle-btn${(statusFilter || paymentFilter || fromDate || toDate) ? ' filter-active' : ''}`}
                            title="Bộ lọc"
                            onClick={() => setShowFilters(v => !v)}
                        >
                            <i className="bi bi-funnel-fill"></i>
                            {(statusFilter || paymentFilter || fromDate || toDate) && (
                                <span className="filter-badge"></span>
                            )}
                        </button>
                        <button className="btn-refresh" onClick={fetchOrders} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className={`table-toolbar order-filter-panel${showFilters ? ' filter-open' : ''}`}>
                <div className="toolbar-left">
                    <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn, tên khách, SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                setCurrentPage(1);
                                const params = {};
                                if (newStatus) params.status = newStatus;
                                if (paymentFilter) params.payment = paymentFilter;
                                setSearchParams(params);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Payment method filter */}
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={paymentFilter}
                            onChange={(e) => {
                                const newPayment = e.target.value;
                                setCurrentPage(1);
                                const params = {};
                                if (statusFilter) params.status = statusFilter;
                                if (newPayment) params.payment = newPayment;
                                setSearchParams(params);
                            }}
                        >
                            <option value="">Tất cả thanh toán</option>
                            <option value="cod">COD (Tiền mặt)</option>
                            <option value="bank">Online</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="desc">Mới nhất</option>
                            <option value="asc">Cũ nhất</option>
                        </select>
                    </div>

                    {/* Nút xóa tất cả bộ lọc */}
                    {(statusFilter || paymentFilter || fromDate || toDate) && (
                        <div className="filter-group">
                            <button
                                className="btn-clear-filter"
                                title="Xóa tất cả bộ lọc"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFromDate('');
                                    setToDate('');
                                    setCurrentPage(1);
                                    setSearchParams({});
                                }}
                            >
                                <i className="bi bi-x-circle"></i>
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Date range filter */}
                <div className="toolbar-left" style={{ marginTop: 8 }}>
                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            <i className="bi bi-calendar3 me-1"></i>Từ ngày
                        </label>
                        <input
                            type="date"
                            className="filter-select"
                            value={fromDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFromDate(val);
                                setCurrentPage(1);
                                const params = {};
                                if (statusFilter) params.status = statusFilter;
                                if (paymentFilter) params.payment = paymentFilter;
                                if (val) params.from = val;
                                if (toDate) params.to = toDate;
                                setSearchParams(params);
                            }}
                        />
                    </div>
                    <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            className="filter-select"
                            value={toDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setToDate(val);
                                setCurrentPage(1);
                                const params = {};
                                if (statusFilter) params.status = statusFilter;
                                if (paymentFilter) params.payment = paymentFilter;
                                if (fromDate) params.from = fromDate;
                                if (val) params.to = val;
                                setSearchParams(params);
                            }}
                        />
                    </div>
                    {(fromDate || toDate) && (
                        <button
                            className="clear-search"
                            style={{ marginLeft: 4 }}
                            title="Xóa bộ lọc ngày"
                            onClick={() => {
                                setFromDate('');
                                setToDate('');
                                const params = {};
                                if (statusFilter) params.status = statusFilter;
                                if (paymentFilter) params.payment = paymentFilter;
                                setSearchParams(params);
                            }}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={orders}
                loading={loading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Trang {currentPage} / {totalPages}
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}

            <OrderDetailModal
                show={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                order={selectedOrder}
                onStatusUpdate={fetchOrders}
            />
        </div>
    );
}
