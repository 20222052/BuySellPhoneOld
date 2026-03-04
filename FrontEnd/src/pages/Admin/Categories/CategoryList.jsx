import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable, { TableBadge } from '../../../components/common/Admin/DataTable';
import { FormInput, FormTextarea } from '../../../components/common/Admin';
import CategoryService from '../../../services/categoryService';
import '../../../assets/css/admin/categories.css';

export default function CategoryList() {
    // State
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0); // Reset to first page when search changes
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await CategoryService.getAll({
                search: debouncedSearch,
                sort: sortOrder,
                page: currentPage,
                pageSize: pageSize
            });
            // Response structure: { code, message, success, data: { items, totalPages, totalItems, ... } }
            const data = response?.data || {};
            const items = data.items || [];
            setCategories(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);
        } catch (error) {
            console.error('Fetch categories error:', error);
            toast.error(error.message || 'Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortOrder, currentPage, pageSize]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Open modal
    const openModal = (mode, category = null) => {
        setModalMode(mode);
        setSelectedCategory(category);
        if (category) {
            setFormData({ name: category.name || '', description: category.description || '' });
        } else {
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setFormData({ name: '', description: '' });
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục!');
            return;
        }

        setFormLoading(true);

        try {
            if (modalMode === 'create') {
                await CategoryService.create(formData);
                toast.success('Tạo danh mục thành công!');
            } else if (modalMode === 'edit') {
                await CategoryService.update(selectedCategory.id, formData);
                toast.success('Cập nhật danh mục thành công!');
            }
            closeModal();
            fetchCategories();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Có lỗi xảy ra!');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await CategoryService.delete(deleteId);
            toast.success('Xóa danh mục thành công!');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            fetchCategories();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Không thể xóa danh mục!');
        }
    };

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Tên danh mục',
            render: (value, row) => (
                <div className="category-name-cell">
                    <span className="fw-medium">{value}</span>
                </div>
            )
        },
        {
            key: 'description',
            label: 'Mô tả',
            render: (value) => (
                <span className="text-muted description-cell" title={value || ''}>
                    {value ? (value.length > 80 ? value.substring(0, 80) + '...' : value) : 'Chưa có mô tả'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '120px',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-action btn-view"
                        onClick={(e) => { e.stopPropagation(); openModal('view', row); }}
                        title="Xem chi tiết"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                    <button
                        className="btn-action btn-edit"
                        onClick={(e) => { e.stopPropagation(); openModal('edit', row); }}
                        title="Chỉnh sửa"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button
                        className="btn-action btn-delete"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(row.id); }}
                        title="Xóa"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page categories-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <i className="bi bi-folder2-open"></i>
                            Quản lý danh mục
                        </h1>

                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchCategories} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                        <button className="btn-primary-admin" onClick={() => openModal('create')}>
                            <i className="bi bi-plus-lg"></i>
                            Thêm danh mục
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
                            placeholder="Tìm kiếm danh mục..."
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
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setCurrentPage(0);
                            }}
                        >
                            <option value="DESC">Mới nhất</option>
                            <option value="ASC">Cũ nhất</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(0);
                            }}
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div>
                </div>

                <div className="toolbar-info">
                    Hiển thị <strong>{categories.length}</strong> / {totalItems} danh mục
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={categories}
                loading={loading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Trang {currentPage + 1} / {totalPages}
                    </div>
                    <div className="pagination-buttons">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(0)}
                            disabled={currentPage === 0}
                            title="Trang đầu"
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            title="Trang trước"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i;
                            } else if (currentPage < 3) {
                                pageNum = i;
                            } else if (currentPage > totalPages - 4) {
                                pageNum = totalPages - 5 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            title="Trang sau"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
                            title="Trang cuối"
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalMode === 'create' && (
                                    <>
                                        <i className="bi bi-plus-circle"></i>
                                        Thêm danh mục mới
                                    </>
                                )}
                                {modalMode === 'edit' && (
                                    <>
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa danh mục
                                    </>
                                )}
                                {modalMode === 'view' && (
                                    <>
                                        <i className="bi bi-eye"></i>
                                        Chi tiết danh mục
                                    </>
                                )}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <FormInput
                                    label="Tên danh mục"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục..."
                                    leftIcon={<i className="bi bi-folder"></i>}
                                    required
                                    disabled={modalMode === 'view'}
                                />

                                <FormTextarea
                                    label="Mô tả"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả danh mục..."
                                    rows={4}
                                    disabled={modalMode === 'view'}
                                />

                                {modalMode === 'view' && selectedCategory && (
                                    <div className="view-details">
                                        <div className="detail-row">
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value">#{selectedCategory.id}</span>
                                        </div>
                                        {/* <div className="detail-row">
                                            <span className="detail-label">Số sản phẩm:</span>
                                            <span className="detail-value">
                                                <TableBadge variant="primary">
                                                    {selectedCategory.productCount || 0} sản phẩm
                                                </TableBadge>
                                            </span>
                                        </div> */}
                                        {selectedCategory.createdAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedCategory.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedCategory.updatedAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Cập nhật lần cuối:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedCategory.updatedAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                                </button>
                                {modalMode !== 'view' && (
                                    <button type="submit" className="btn-submit-modal" disabled={formLoading}>
                                        {formLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                {modalMode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
                                            </>
                                        )}
                                    </button>
                                )}
                                {modalMode === 'view' && (
                                    <button
                                        type="button"
                                        className="btn-submit-modal"
                                        onClick={() => openModal('edit', selectedCategory)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header delete-header">
                            <div className="delete-icon">
                                <i className="bi bi-exclamation-triangle"></i>
                            </div>
                        </div>
                        <div className="modal-body text-center">
                            <h4>Xác nhận xóa</h4>
                            <p className="text-muted">
                                Bạn có chắc chắn muốn xóa danh mục này?<br />
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="modal-footer justify-center">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn-delete-confirm"
                                onClick={handleDelete}
                            >
                                <i className="bi bi-trash"></i>
                                Xóa danh mục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
