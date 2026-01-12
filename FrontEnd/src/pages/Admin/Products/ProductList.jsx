import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import { FormInput, FormTextarea, FormSelect } from '../../../components/common/Admin';
import ProductService from '../../../services/productService';
import CategoryService from '../../../services/categoryService';
import BrandService from '../../../services/brandService';
import '../../../assets/css/admin/categories.css';
import '../../../assets/css/admin/products.css';

export default function ProductList() {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brandId: '',
        categoryId: '',
        status: 'active',
        warrantyMonths: 12
    });
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Options for dropdowns
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
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
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch brands and categories for dropdowns
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    BrandService.getAll({ pageSize: 100 }),
                    CategoryService.getAll({ pageSize: 100 })
                ]);
                setBrands(brandsRes?.data?.items || []);
                setCategories(categoriesRes?.data?.items || []);
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };
        fetchOptions();
    }, []);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ProductService.getAll({
                search: debouncedSearch,
                brandId: filterBrand,
                categoryId: filterCategory,
                status: filterStatus,
                sort: sortOrder,
                page: currentPage,
                pageSize: pageSize
            });
            const data = response?.data || {};
            const items = data.items || [];
            setProducts(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error(error.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filterBrand, filterCategory, filterStatus, sortOrder, currentPage, pageSize]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Open modal
    const openModal = (mode, product = null) => {
        setModalMode(mode);
        setSelectedProduct(product);
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                brandId: product.brandId || product.brand?.id || '',
                categoryId: product.categoryId || product.category?.id || '',
                status: product.status || 'active',
                warrantyMonths: product.warrantyMonths || 12
            });
        } else {
            setFormData({
                name: '',
                description: '',
                brandId: '',
                categoryId: '',
                status: 'active',
                warrantyMonths: 12
            });
        }
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            brandId: '',
            categoryId: '',
            status: 'active',
            warrantyMonths: 12
        });
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
            toast.error('Vui lòng nhập tên sản phẩm!');
            return;
        }

        if (!formData.brandId) {
            toast.error('Vui lòng chọn hãng sản xuất!');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Vui lòng chọn danh mục!');
            return;
        }

        setFormLoading(true);
        try {
            if (modalMode === 'create') {
                await ProductService.create(formData);
                toast.success('Thêm sản phẩm thành công!');
            } else if (modalMode === 'edit') {
                await ProductService.update(selectedProduct.id, formData);
                toast.success('Cập nhật sản phẩm thành công!');
            }
            closeModal();
            fetchProducts();
        } catch (error) {
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
            await ProductService.delete(deleteId);
            toast.success('Xóa sản phẩm thành công!');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            fetchProducts();
        } catch (error) {
            toast.error(error.message || 'Không thể xóa sản phẩm!');
        }
    };

    // Status config
    const statusConfig = {
        active: { text: 'Hoạt động', class: 'status-active' },
        inactive: { text: 'Ẩn', class: 'status-inactive' },
        draft: { text: 'Nháp', class: 'status-draft' }
    };

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Ẩn' },
        { value: 'draft', label: 'Nháp' }
    ];

    // Table columns
    const columns = [
        {
            key: 'name',
            label: 'Tên sản phẩm',
            render: (value, row) => (
                <div className="category-name-cell">
                    <span className="fw-medium">{value}</span>
                </div>
            )
        },
        {
            key: 'brandName',
            label: 'Hãng',
            render: (value, row) => value || row.brand?.name || '-'
        },
        {
            key: 'categoryName',
            label: 'Danh mục',
            render: (value, row) => value || row.category?.name || '-'
        },
        {
            key: 'warrantyMonths',
            label: 'Bảo hành',
            render: (value) => value ? `${value} tháng` : '-'
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => {
                const config = statusConfig[value] || statusConfig.draft;
                return <span className={`status-badge ${config.class}`}>{config.text}</span>;
            }
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
                            <i className="bi bi-box-seam"></i>
                            Quản lý sản phẩm
                        </h1>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchProducts} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                        <button className="btn-primary-admin" onClick={() => openModal('create')}>
                            <i className="bi bi-plus-lg"></i>
                            Thêm sản phẩm
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
                            placeholder="Tìm kiếm sản phẩm..."
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
                            value={filterBrand}
                            onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="">Tất cả hãng</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            {statusOptions.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="DESC">Mới nhất</option>
                            <option value="ASC">Cũ nhất</option>
                        </select>
                    </div>

                    {/* <div className="filter-group">
                        <select
                            className="filter-select"
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div> */}
                </div>

            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={products}
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
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalMode === 'create' && <><i className="bi bi-plus-circle"></i> Thêm sản phẩm mới</>}
                                {modalMode === 'edit' && <><i className="bi bi-pencil"></i> Chỉnh sửa sản phẩm</>}
                                {modalMode === 'view' && <><i className="bi bi-eye"></i> Chi tiết sản phẩm</>}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <FormInput
                                    label="Tên sản phẩm"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                    disabled={modalMode === 'view'}
                                />

                                <div className="form-row-2">
                                    <FormSelect
                                        label="Hãng sản xuất"
                                        name="brandId"
                                        value={formData.brandId}
                                        onChange={handleChange}
                                        options={brands.map(b => ({ value: b.id, label: b.name }))}
                                        placeholder="Chọn hãng sản xuất"
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                    <FormSelect
                                        label="Danh mục"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                                        placeholder="Chọn danh mục"
                                        required
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                <div className="form-row-2">
                                    <FormSelect
                                        label="Trạng thái"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={statusOptions}
                                        disabled={modalMode === 'view'}
                                    />
                                    <FormInput
                                        label="Bảo hành (tháng)"
                                        name="warrantyMonths"
                                        type="number"
                                        value={formData.warrantyMonths}
                                        onChange={handleChange}
                                        placeholder="Số tháng bảo hành"
                                        min="0"
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                <FormTextarea
                                    label="Mô tả"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả sản phẩm"
                                    rows={4}
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                                </button>
                                {modalMode !== 'view' && (
                                    <button type="submit" className="btn-submit-modal" disabled={formLoading}>
                                        {formLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                {modalMode === 'create' ? 'Thêm mới' : 'Cập nhật'}
                                            </>
                                        )}
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
                            <p className="text-muted">Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                            <p className="text-muted small">Hành động này không thể hoàn tác và sẽ xóa tất cả biến thể liên quan.</p>
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
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
