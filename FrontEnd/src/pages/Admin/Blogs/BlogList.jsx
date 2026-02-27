import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import { FormInput } from '../../../components/common/Admin';
import BlogService from '../../../services/blogService';
import SummernoteEditor from '../../../components/common/Admin/SummernoteEditor';
import BlogComments from '../../Home/BlogComments';
import '../../../assets/css/admin/brands.css';

export default function BlogList() {
    // State
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',
        author: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showFullContent, setShowFullContent] = useState(false);

    // Image upload state
    const [uploadingImage, setUploadingImage] = useState(false);

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
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch blogs
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await BlogService.getAll({
                search: debouncedSearch,
                sort: sortOrder,
                page: currentPage,
                pageSize: pageSize
            });
            const data = response?.data || {};
            const items = data.items || [];
            setBlogs(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalElements || items.length);
        } catch (error) {
            console.error('Fetch blogs error:', error);
            toast.error(error.message || 'Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortOrder, currentPage, pageSize]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Open modal
    const openModal = (mode, blog = null) => {
        setModalMode(mode);
        setSelectedBlog(blog);
        setShowFullContent(false);
        if (blog) {
            setFormData({
                title: blog.title || '',
                content: blog.content || '',
                imageUrl: blog.imageUrl || '',
                author: blog.author || ''
            });
        } else {
            setFormData({ title: '', content: '', imageUrl: '', author: '' });
        }
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedBlog(null);
        setFormData({ title: '', content: '', imageUrl: '', author: '' });
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Chỉ chấp nhận file png, jpg, webp
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const invalidFile = files.find(file => !allowedTypes.includes(file.type));
        if (invalidFile) {
            toast.error("Chỉ chấp nhận file ảnh PNG, JPG hoặc WEBP!");
            return;
        }

        // Only allow single file for blog
        if (files.length > 1) {
            toast.warning("Chỉ có thể tải lên 1 ảnh. Ảnh đầu tiên sẽ được sử dụng.");
        }

        setUploadingImage(true);
        try {
            const file = files[0];
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "/api"}/upload/image`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: formDataUpload
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            const uploadedImage = result.data;

            // Auto-fill the imageUrl field
            setFormData(prev => ({
                ...prev,
                imageUrl: uploadedImage.secureUrl
            }));

            toast.success('Đã upload ảnh thành công!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể upload ảnh. Vui lòng thử lại!');
        } finally {
            setUploadingImage(false);
            // Reset file input
            e.target.value = '';
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề bài viết!');
            return;
        }

        if (!formData.content.trim()) {
            toast.error('Vui lòng nhập nội dung bài viết!');
            return;
        }

        setFormLoading(true);

        try {
            if (modalMode === 'create') {
                await BlogService.create(formData);
                toast.success('Tạo bài viết thành công!');
            } else if (modalMode === 'edit') {
                await BlogService.update(selectedBlog.id, formData);
                toast.success('Cập nhật bài viết thành công!');
            }
            closeModal();
            fetchBlogs();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Có lỗi xảy ra!');
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await BlogService.delete(deleteId);
            toast.success('Xóa bài viết thành công!');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            fetchBlogs();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Không thể xóa bài viết!');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Format views
    const formatViews = (count) => {
        if (!count) return '0';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    // Table columns
    const columns = [
        {
            key: 'imageUrl',
            label: 'Ảnh',
            width: '80px',
            render: (value) => (
                <div className="brand-logo-cell">
                    {value ? (
                        <img
                            src={value}
                            alt="Thumbnail"
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
            key: 'title',
            label: 'Tiêu đề',
            render: (value) => (
                <span className="fw-medium" style={{ maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {value}
                </span>
            )
        },
        {
            key: 'author',
            label: 'Tác giả',
            width: '120px',
            render: (value) => value || '-'
        },
        {
            key: 'viewCount',
            label: 'Lượt xem',
            width: '100px',
            render: (value) => (
                <span>
                    <i className="bi bi-eye me-1"></i>
                    {formatViews(value)}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            width: '110px',
            render: (value) => formatDate(value)
        },
        {
            key: 'createdByUserName',
            label: 'Người tạo',
            width: '120px',
            render: (value) => value || '-'
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
                            <i className="bi bi-newspaper"></i>
                            Quản lý bài viết
                        </h1>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchBlogs} disabled={loading}>
                            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        </button>
                        <button className="btn-primary-admin" onClick={() => openModal('create')}>
                            <i className="bi bi-plus-lg"></i>
                            Thêm bài viết
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
                            placeholder="Tìm kiếm bài viết..."
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
                    Hiển thị <strong>{blogs.length}</strong> / {totalItems} bài viết
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={blogs}
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
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
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
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(totalPages - 1)}
                            disabled={currentPage === totalPages - 1}
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
                                {modalMode === 'create' && (
                                    <>
                                        <i className="bi bi-plus-circle"></i>
                                        Thêm bài viết mới
                                    </>
                                )}
                                {modalMode === 'edit' && (
                                    <>
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa bài viết
                                    </>
                                )}
                                {modalMode === 'view' && (
                                    <>
                                        <i className="bi bi-eye"></i>
                                        Chi tiết bài viết
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
                                    label="Tiêu đề bài viết"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    leftIcon={<i className="bi bi-type-h1"></i>}
                                    required
                                    disabled={modalMode === 'view'}
                                    style={{ textAlign: 'left', alignItems: 'flex-start' }}
                                />

                                <FormInput
                                    label="Tác giả"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Nhập tên tác giả..."
                                    leftIcon={<i className="bi bi-person"></i>}
                                    disabled={modalMode === 'view'}
                                />

                                {/* Image Upload Section */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="bi bi-image me-2"></i>
                                        Ảnh đại diện
                                    </label>

                                    {modalMode !== 'view' && (
                                        <div className="mb-3" style={{ display: 'flex', gap: '8px' }}>
                                            <label
                                                className="btn btn-outline-primary"
                                                style={{
                                                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                                                    opacity: uploadingImage ? 0.6 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <i className={uploadingImage ? "bi bi-hourglass-split" : "bi bi-cloud-upload"}></i>
                                                {uploadingImage ? 'Đang tải...' : 'Tải ảnh lên'}
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                                    onChange={handleFileUpload}
                                                    disabled={uploadingImage}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#6c757d',
                                                fontSize: '0.9rem'
                                            }}>
                                                hoặc nhập URL bên dưới
                                            </span>
                                        </div>
                                    )}

                                    <FormInput
                                        label=""
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        leftIcon={<i className="bi bi-link-45deg"></i>}
                                        disabled={modalMode === 'view'}
                                    />
                                </div>

                                {formData.imageUrl && (
                                    <div className="mb-3">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: 200,
                                                borderRadius: 8,
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Nội dung bài viết</label>
                                    {modalMode !== 'view' ? (
                                        <SummernoteEditor
                                            value={formData.content}
                                            onChange={content => setFormData(prev => ({ ...prev, content }))}
                                            placeholder="Nhập nội dung bài viết (có thể sử dụng HTML)..."
                                            height={300}
                                            disabled={formLoading}
                                        />
                                    ) : (
                                        <div>
                                            <div style={{ position: 'relative' }}>
                                                <div
                                                    className="blog-content"
                                                    dangerouslySetInnerHTML={{ __html: formData.content }}
                                                    style={{
                                                        maxHeight: showFullContent ? 'none' : '320px',
                                                        overflow: 'hidden',
                                                        padding: '12px 16px',
                                                        background: '#f8f9fa',
                                                        borderRadius: 8,
                                                        border: '1px solid #dee2e6',
                                                        lineHeight: 1.7,
                                                        fontSize: '0.95rem'
                                                    }}
                                                />
                                                {!showFullContent && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: 60,
                                                        background: 'linear-gradient(transparent, #f8f9fa)',
                                                        borderRadius: '0 0 8px 8px',
                                                        pointerEvents: 'none'
                                                    }} />
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => setShowFullContent(v => !v)}
                                                >
                                                    {showFullContent ? (
                                                        <><i className="bi bi-chevron-up me-1" />Thu gọn</>
                                                    ) : (
                                                        <><i className="bi bi-chevron-down me-1" />Xem thêm</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {modalMode === 'view' && selectedBlog && (
                                    <>
                                        <div className="view-details mt-3">
                                            <div className="detail-row">
                                                <span className="detail-label">ID:</span>
                                                <span className="detail-value" style={{ fontSize: '0.8rem' }}>
                                                    {selectedBlog.id}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Lượt xem:</span>
                                                <span className="detail-value">
                                                    {formatViews(selectedBlog.viewCount)}
                                                </span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">
                                                    {formatDate(selectedBlog.createdAt)}
                                                </span>
                                            </div>
                                            {selectedBlog.createdByUserName && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Người tạo:</span>
                                                    <span className="detail-value">
                                                        {selectedBlog.createdByUserName}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedBlog.updatedAt && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Cập nhật lần cuối:</span>
                                                    <span className="detail-value">
                                                        {formatDate(selectedBlog.updatedAt)}
                                                        {selectedBlog.updatedByUserName && ` bởi ${selectedBlog.updatedByUserName}`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comments Section */}
                                        <div className="mt-4" style={{ borderTop: '1px solid #dee2e6', paddingTop: 16 }}>
                                            <BlogComments blogId={selectedBlog.id} />
                                        </div>
                                    </>
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
                                                {modalMode === 'create' ? 'Tạo bài viết' : 'Lưu thay đổi'}
                                            </>
                                        )}
                                    </button>
                                )}
                                {modalMode === 'view' && (
                                    <button
                                        type="button"
                                        className="btn-submit-modal"
                                        onClick={() => openModal('edit', selectedBlog)}
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
                                Bạn có chắc chắn muốn xóa bài viết này?<br />
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
                                Xóa bài viết
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
