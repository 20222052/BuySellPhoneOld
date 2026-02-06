import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import diagnosticService from '../../../services/diagnosticService';
import TradeInDetailModal from './TradeInDetailModal';
import '../../../assets/css/admin/categories.css';

export default function TradeInList() {
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchDiagnostics = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: pageSize,
                sortBy: 'testDate',
                sortDir: sortOrder
            };
            if (statusFilter) {
                params.status = statusFilter;
            }

            const result = await diagnosticService.getAllForAdmin(params);
            setDiagnostics(result.content || []);
            setTotalPages(result.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch diagnostics:', error);
            toast.error('Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter, sortOrder]);

    useEffect(() => {
        fetchDiagnostics();
    }, [fetchDiagnostics]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await diagnosticService.updateStatus(id, newStatus);
            toast.success('Cập nhật trạng thái thành công');
            fetchDiagnostics();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleViewDetail = (diagnostic) => {
        setSelectedDiagnostic(diagnostic);
        setShowDetailModal(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const formatPercent = (value) => {
        if (value === null || value === undefined) return '-';
        return `${parseFloat(value).toFixed(1)}%`;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Chờ xử lý',
            tested: 'Đã kiểm tra',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    const columns = [
        {
            key: 'testDate',
            label: 'Ngày yêu cầu',
            render: (value) => <span className="order-date">{formatDate(value)}</span>
        },
        {
            key: 'productItemId',
            label: 'Mã sản phẩm',
            render: (value) => (
                <span className="order-code">
                    #{value?.substring(0, 8)}...
                </span>
            )
        },
        {
            key: 'totalDepreciation',
            label: 'Độ hao mòn',
            render: (value) => {
                const numValue = parseFloat(value) || 0;
                const colorClass = numValue > 30 ? 'text-danger' : numValue > 15 ? 'text-warning' : 'text-success';
                return (
                    <span className={`fw-bold ${colorClass}`}>
                        {formatPercent(value)}
                    </span>
                );
            }
        },
        {
            key: 'batteryHealth',
            label: 'Pin',
            render: (value) => (
                <span className="fw-medium">
                    {formatPercent(value)}
                </span>
            )
        },
        {
            key: 'overallAssessment',
            label: 'Đánh giá',
            render: (value) => (
                <span className="text-muted" style={{ maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value?.substring(0, 40) || '-'}
                    {value?.length > 40 ? '...' : ''}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => (
                <span className={`status-badge status-${value?.toLowerCase()}`}>
                    {getStatusLabel(value)}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-action btn-view"
                        onClick={() => handleViewDetail(row)}
                        title="Xem chi tiết"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                    {row.status === 'pending' && (
                        <>
                            <button
                                className="btn-action btn-edit"
                                onClick={() => handleStatusChange(row.id, 'tested')}
                                title="Đánh dấu đã kiểm tra"
                            >
                                <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                                className="btn-action btn-delete"
                                onClick={() => handleStatusChange(row.id, 'cancelled')}
                                title="Hủy yêu cầu"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </>
                    )}
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
                            <i className="bi bi-arrow-left-right"></i>
                            Quản lý yêu cầu Trade-In
                        </h1>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchDiagnostics} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="table-toolbar">
                <div className="toolbar-left">
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
                            <option value="pending">Chờ xử lý</option>
                            <option value="tested">Đã kiểm tra</option>
                            <option value="cancelled">Đã hủy</option>
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
                            <option value="DESC">Mới nhất</option>
                            <option value="ASC">Cũ nhất</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={diagnostics}
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

            {/* Detail Modal */}
            {showDetailModal && selectedDiagnostic && (
                <TradeInDetailModal
                    diagnostic={selectedDiagnostic}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedDiagnostic(null);
                    }}
                    onStatusChange={(newStatus) => {
                        handleStatusChange(selectedDiagnostic.id, newStatus);
                        setShowDetailModal(false);
                        setSelectedDiagnostic(null);
                    }}
                />
            )}
        </div>
    );
}
