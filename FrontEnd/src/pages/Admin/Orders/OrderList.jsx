import { useState, useEffect, useCallback } from 'react';
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

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortBy, setSortBy] = useState('createdAt');
    const [statusFilter, setStatusFilter] = useState('');
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

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await OrderService.getAll({
                search: debouncedSearch,
                status: statusFilter,
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
    }, [debouncedSearch, sortOrder, sortBy, statusFilter, currentPage, pageSize]);

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
                        <button className="btn-refresh" onClick={fetchOrders} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="table-toolbar">
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
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipping">Shipping</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
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
