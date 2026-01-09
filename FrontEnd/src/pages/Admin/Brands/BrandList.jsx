import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import { FormInput } from '../../../components/common/Admin';
import BrandService from '../../../services/brandService';
import '../../../assets/css/admin/brands.css';

export default function BrandList() {
    // State
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [formData, setFormData] = useState({ name: '', logoUrl: '' });
    const [logoFile, setLogoFile] = useState(null); // State cho file logo
    const [logoPreview, setLogoPreview] = useState(''); // Preview URL cho ảnh mới
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

    // Fetch brands
    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const response = await BrandService.getAll({
                search: debouncedSearch,
                sort: sortOrder,
                page: currentPage,
                pageSize: pageSize
            });
            // Response structure: { code, message, success, data: { items, totalPages, totalItems, ... } }
            const data = response?.data || {};
            const items = data.items || [];
            setBrands(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);
        } catch (error) {
            console.error('Fetch brands error:', error);
            toast.error(error.message || 'Không thể tải danh sách hãng sản xuất');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortOrder, currentPage, pageSize]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // Open modal
    const openModal = (mode, brand = null) => {
        setModalMode(mode);
        setSelectedBrand(brand);
        if (brand) {
            setFormData({ name: brand.name || '', logoUrl: brand.logoUrl || '' });
            setLogoPreview(brand.logoUrl || '');
        } else {
            setFormData({ name: '', logoUrl: '' });
            setLogoPreview('');
        }
        setLogoFile(null);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedBrand(null);
        setFormData({ name: '', logoUrl: '' });
        setLogoFile(null);
        setLogoPreview('');
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file hình ảnh!');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB!');
                return;
            }
            setLogoFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    // Remove selected file
    const removeLogoFile = () => {
        setLogoFile(null);
        setLogoPreview(formData.logoUrl || '');
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên hãng sản xuất!');
            return;
        }

        setFormLoading(true);

        try {
            if (modalMode === 'create') {
                // Sử dụng API mới với upload file
                await BrandService.createWithLogo(formData.name, logoFile);
                toast.success('Tạo hãng sản xuất thành công!');
            } else if (modalMode === 'edit') {
                // Sử dụng API mới với upload file
                await BrandService.updateWithLogo(selectedBrand.id, formData.name, logoFile);
                toast.success('Cập nhật hãng sản xuất thành công!');
            }
            closeModal();
            fetchBrands();
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
            await BrandService.delete(deleteId);
            toast.success('Xóa hãng sản xuất thành công!');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            fetchBrands();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Không thể xóa hãng sản xuất!');
        }
    };

    // Table columns
    const columns = [
        {
            key: 'logoUrl',
            label: 'Logo',
            width: '80px',
            render: (value) => (
                <div className="brand-logo-cell">
                    {value ? (
                        <img
                            src={value}
                            alt="Logo"
                            className="brand-logo-img"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="brand-logo-placeholder" style={{ display: value ? 'none' : 'flex' }}>
                        <i className="bi bi-image"></i>
                    </div>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Tên hãng',
            render: (value) => (
                <span className="fw-medium">{value}</span>
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
        <div className="admin-page brands-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <i className="bi bi-building"></i>
                            Quản lý hãng sản xuất
                        </h1>

                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchBrands} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                        <button className="btn-primary-admin" onClick={() => openModal('create')}>
                            <i className="bi bi-plus-lg"></i>
                            Thêm hãng
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
                            placeholder="Tìm kiếm hãng sản xuất..."
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
                    Hiển thị <strong>{brands.length}</strong> / {totalItems} hãng
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={brands}
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
                                        Thêm hãng sản xuất mới
                                    </>
                                )}
                                {modalMode === 'edit' && (
                                    <>
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa hãng sản xuất
                                    </>
                                )}
                                {modalMode === 'view' && (
                                    <>
                                        <i className="bi bi-eye"></i>
                                        Chi tiết hãng sản xuất
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
                                    label="Tên hãng sản xuất"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên hãng sản xuất..."
                                    leftIcon={<i className="bi bi-building"></i>}
                                    required
                                    disabled={modalMode === 'view'}
                                />

                                {/* Logo Upload Section */}
                                {modalMode !== 'view' && (
                                    <div className="form-group">
                                        <label className="form-label">Logo hãng sản xuất</label>
                                        <div className="logo-upload-container">
                                            {/* Drop zone / Upload area */}
                                            <div
                                                className="logo-dropzone"
                                                onClick={() => document.getElementById('logo-input').click()}
                                            >
                                                {logoPreview ? (
                                                    <div className="logo-preview-wrapper">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="logo-preview-image"
                                                        />
                                                        <div className="logo-overlay">
                                                            <i className="bi bi-camera"></i>
                                                            <span>Thay đổi logo</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="upload-placeholder">
                                                        <i className="bi bi-cloud-arrow-up"></i>
                                                        <span>Click để tải logo lên</span>
                                                        <small>PNG, JPG, WEBP (tối đa 5MB)</small>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="logo-input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            {/* File info & remove button */}
                                            {logoFile && (
                                                <div className="file-info">
                                                    <span className="file-name">
                                                        <i className="bi bi-file-image"></i>
                                                        {logoFile.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn-remove-file"
                                                        onClick={removeLogoFile}
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Logo Preview for View mode */}
                                {modalMode === 'view' && formData.logoUrl && (
                                    <div className="logo-preview">
                                        <label className="form-label">Logo</label>
                                        <div className="logo-preview-img">
                                            <img
                                                src={formData.logoUrl}
                                                alt="Logo preview"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Error'}
                                            />
                                        </div>
                                    </div>
                                )}

                                {modalMode === 'view' && selectedBrand && (
                                    <div className="view-details">
                                        <div className="detail-row">
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value">#{selectedBrand.id}</span>
                                        </div>
                                        {selectedBrand.createdAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedBrand.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedBrand.updatedAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Cập nhật lần cuối:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedBrand.updatedAt).toLocaleString('vi-VN')}
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
                                                {modalMode === 'create' ? 'Tạo hãng' : 'Lưu thay đổi'}
                                            </>
                                        )}
                                    </button>
                                )}
                                {modalMode === 'view' && (
                                    <button
                                        type="button"
                                        className="btn-submit-modal"
                                        onClick={() => openModal('edit', selectedBrand)}
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
                                Bạn có chắc chắn muốn xóa hãng sản xuất này?<br />
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
                                Xóa hãng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
