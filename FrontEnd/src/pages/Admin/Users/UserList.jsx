import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../../components/common/Admin/DataTable';
import { FormInput, FormSelect } from '../../../components/common/Admin';
import UserService from '../../../services/userService';
import '../../../assets/css/admin/users.css';

export default function UserList() {
    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'edit' | 'view'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        birthDate: '',
        status: 'active',
        roles: [],
        password: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [showLockConfirm, setShowLockConfirm] = useState(false);
    const [lockAction, setLockAction] = useState({ id: null, currentStatus: null });
    const [showPassword, setShowPassword] = useState(false);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
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

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await UserService.getAll({
                search: debouncedSearch,
                sort: sortOrder,
                status: statusFilter,
                role: roleFilter,
                page: currentPage,
                pageSize: pageSize
            });
            // Response structure: { code, message, success, data: { items, totalPages, totalItems, ... } }
            const data = response?.data || {};
            const items = data.items || [];
            setUsers(Array.isArray(items) ? items : []);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error(error.message || 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortOrder, statusFilter, roleFilter, currentPage, pageSize]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Open modal
    const openModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || '',
                birthDate: user.birthDate || '',
                status: user.status || 'active',
                roles: user.roles?.map(r => r.name) || [],
                password: ''
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                gender: '',
                birthDate: '',
                status: 'active',
                roles: [],
                password: ''
            });
        }
        setShowPassword(false);
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            gender: '',
            birthDate: '',
            status: 'active',
            roles: [],
            password: ''
        });
        setShowPassword(false);
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle role checkbox change
    const handleRoleChange = (roleName) => {
        setFormData(prev => {
            const currentRoles = prev.roles || [];
            if (currentRoles.includes(roleName)) {
                return { ...prev, roles: currentRoles.filter(r => r !== roleName) };
            } else {
                return { ...prev, roles: [...currentRoles, roleName] };
            }
        });
    };

    // Handle submit (Edit only)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            toast.error('Vui lòng nhập họ tên!');
            return;
        }

        setFormLoading(true);

        try {
            // Chỉ gửi các trường đã được điền
            const updateData = {};

            if (formData.fullName?.trim()) updateData.fullName = formData.fullName.trim();
            if (formData.phone?.trim()) updateData.phone = formData.phone.trim();
            if (formData.gender) updateData.gender = formData.gender;
            if (formData.birthDate) updateData.birthDate = formData.birthDate;
            if (formData.roles?.length > 0) updateData.roles = formData.roles;
            if (formData.password?.trim()) updateData.password = formData.password.trim();

            await UserService.update(selectedUser.id, updateData);
            toast.success('Cập nhật thông tin người dùng thành công!');
            closeModal();
            fetchUsers();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Có lỗi xảy ra!');
        } finally {
            setFormLoading(false);
        }
    };

    // Handle lock/unlock
    const confirmLockToggle = (id, currentStatus) => {
        setLockAction({ id, currentStatus });
        setShowLockConfirm(true);
    };

    const handleLockToggle = async () => {
        if (!lockAction.id) return;

        try {
            await UserService.toggleStatus(lockAction.id, lockAction.currentStatus);
            const action = lockAction.currentStatus === 'active' ? 'khóa' : 'mở khóa';
            toast.success(`Đã ${action} tài khoản thành công!`);
            setShowLockConfirm(false);
            setLockAction({ id: null, currentStatus: null });
            fetchUsers();
        } catch (error) {
            console.error('Lock/Unlock error:', error);
            toast.error(error.message || 'Không thể thay đổi trạng thái tài khoản!');
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        if (status === 'active') {
            return <span className="status-badge status-active">Hoạt động</span>;
        }
        return <span className="status-badge status-inactive">Đã khóa</span>;
    };

    // Get roles display
    const getRolesDisplay = (roles) => {
        if (!roles || roles.length === 0) return <span className="text-muted">Chưa có</span>;
        return roles.map((role, index) => (
            <span key={role.id || index} className={`role-badge role-${role.name?.toLowerCase() || 'user'}`}>
                {role.name || 'user'}
            </span>
        ));
    };

    // Table columns
    const columns = [
        {
            key: 'fullName',
            label: 'Họ tên',
            render: (value, row) => (
                <div className="user-info-cell">
                    <div className="user-avatar">
                        {value ? value.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{value || 'Chưa cập nhật'}</span>
                        <span className="user-email">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Số điện thoại',
            render: (value) => value || <span className="text-muted">Chưa cập nhật</span>
        },
        {
            key: 'roles',
            label: 'Vai trò',
            width: '150px',
            render: (value) => (
                <div className="roles-cell">
                    {getRolesDisplay(value)}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '120px',
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '140px',
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
                        className={`btn-action ${row.status === 'active' ? 'btn-lock' : 'btn-unlock'}`}
                        onClick={(e) => { e.stopPropagation(); confirmLockToggle(row.id, row.status); }}
                        title={row.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                        <i className={`bi ${row.status === 'active' ? 'bi-lock' : 'bi-unlock'}`}></i>
                    </button>
                </div>
            )
        }
    ];

    // Gender options
    const genderOptions = [
        { value: '', label: 'Chọn giới tính' },
        { value: 'MALE', label: 'Nam' },
        { value: 'FEMALE', label: 'Nữ' },
        { value: 'OTHER', label: 'Khác' }
    ];

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Đã khóa' }
    ];

    // Available roles
    const availableRoles = [
        { name: 'admin', label: 'Quản trị viên', description: 'Toàn quyền quản lý hệ thống' },
        { name: 'user', label: 'Người dùng', description: 'Quyền cơ bản' }
    ];

    return (
        <div className="admin-page users-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            <i className="bi bi-people"></i>
                            Quản lý người dùng
                        </h1>
                    </div>
                    <div className="page-header-right">
                        <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
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
                            placeholder="Tìm kiếm người dùng..."
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
                                setCurrentPage(0);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Đã khóa</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(0);
                            }}
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
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
                    Hiển thị <strong>{users.length}</strong> / {totalItems} người dùng
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                title=""
                columns={columns}
                data={users}
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

            {/* View/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalMode === 'edit' && (
                                    <>
                                        <i className="bi bi-pencil-square"></i>
                                        Chỉnh sửa người dùng
                                    </>
                                )}
                                {modalMode === 'view' && (
                                    <>
                                        <i className="bi bi-eye"></i>
                                        Chi tiết người dùng
                                    </>
                                )}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* User Avatar Header */}
                                {modalMode === 'view' && selectedUser && (
                                    <div className="user-modal-header">
                                        <div className="user-avatar-large">
                                            {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="user-modal-info">
                                            <h4>{selectedUser.fullName || 'Chưa cập nhật'}</h4>
                                            <p>{selectedUser.email}</p>
                                            {getStatusBadge(selectedUser.status)}
                                        </div>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-col">
                                        <FormInput
                                            label="Họ và tên"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Nhập họ và tên..."
                                            leftIcon={<i className="bi bi-person"></i>}
                                            required
                                            disabled={modalMode === 'view'}
                                        />
                                    </div>
                                    <div className="form-col">
                                        <FormInput
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email..."
                                            leftIcon={<i className="bi bi-envelope"></i>}
                                            disabled={true} // Email không cho sửa
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-col">
                                        <FormInput
                                            label="Số điện thoại"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại..."
                                            leftIcon={<i className="bi bi-telephone"></i>}
                                            disabled={modalMode === 'view'}
                                        />
                                    </div>
                                    <div className="form-col">
                                        <FormSelect
                                            label="Giới tính"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            options={genderOptions}
                                            leftIcon={<i className="bi bi-gender-ambiguous"></i>}
                                            disabled={modalMode === 'view'}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-col">
                                        <FormInput
                                            label="Ngày sinh"
                                            name="birthDate"
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            leftIcon={<i className="bi bi-calendar"></i>}
                                            disabled={modalMode === 'view'}
                                        />
                                    </div>
                                    <div className="form-col">
                                        {modalMode === 'edit' ? (
                                            <FormSelect
                                                label="Trạng thái"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                options={statusOptions}
                                                leftIcon={<i className="bi bi-toggle-on"></i>}
                                            />
                                        ) : (
                                            <div className="form-group">
                                                <label className="form-label">Trạng thái</label>
                                                <div className="status-display">
                                                    {getStatusBadge(formData.status)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Roles Section - Edit Mode */}
                                {modalMode === 'edit' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="bi bi-shield-check me-2"></i>
                                            Vai trò
                                        </label>
                                        <div className="roles-checkbox-group">
                                            {availableRoles.map(role => (
                                                <label key={role.name} className="role-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.roles?.includes(role.name) || false}
                                                        onChange={() => handleRoleChange(role.name)}
                                                    />
                                                    <span className="role-checkbox-content">
                                                        <span className={`role-badge role-${role.name}`}>{role.label}</span>
                                                        <small className="role-description">{role.description}</small>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Password Section - Edit Mode */}
                                {modalMode === 'edit' && (
                                    <div className="form-group password-section">
                                        <label className="form-label">
                                            <i className="bi bi-key me-2"></i>
                                            Đặt mật khẩu mới
                                            <small className="text-muted ms-2">(Để trống nếu không muốn thay đổi)</small>
                                        </label>
                                        <div className="password-input-wrapper">
                                            <i className="bi bi-lock input-icon-left"></i>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Nhập mật khẩu mới..."
                                                className="form-input"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                            </button>
                                        </div>
                                        <small className="form-hint">
                                            Mật khẩu mới sẽ được đặt trực tiếp mà không cần xác nhận mật khẩu cũ.
                                        </small>
                                    </div>
                                )}

                                {modalMode === 'view' && selectedUser && (
                                    <div className="view-details">
                                        <div className="detail-row">
                                            <span className="detail-label">ID:</span>
                                            <span className="detail-value detail-id">#{selectedUser.id}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Vai trò:</span>
                                            <span className="detail-value">
                                                <div className="roles-cell">
                                                    {getRolesDisplay(selectedUser.roles)}
                                                </div>
                                            </span>
                                        </div>
                                        {selectedUser.createdAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Ngày tạo:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedUser.updatedAt && (
                                            <div className="detail-row">
                                                <span className="detail-label">Cập nhật lần cuối:</span>
                                                <span className="detail-value">
                                                    {new Date(selectedUser.updatedAt).toLocaleString('vi-VN')}
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
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </button>
                                )}
                                {modalMode === 'view' && (
                                    <button
                                        type="button"
                                        className="btn-submit-modal"
                                        onClick={() => openModal('edit', selectedUser)}
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

            {/* Lock/Unlock Confirmation Modal */}
            {showLockConfirm && (
                <div className="modal-overlay" onClick={() => setShowLockConfirm(false)}>
                    <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className={`modal-header ${lockAction.currentStatus === 'active' ? 'lock-header' : 'unlock-header'}`}>
                            <div className="lock-icon">
                                <i className={`bi ${lockAction.currentStatus === 'active' ? 'bi-lock' : 'bi-unlock'}`}></i>
                            </div>
                        </div>
                        <div className="modal-body text-center">
                            <h4>
                                {lockAction.currentStatus === 'active' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
                            </h4>
                            <p className="text-muted">
                                {lockAction.currentStatus === 'active'
                                    ? 'Người dùng này sẽ không thể đăng nhập sau khi bị khóa.'
                                    : 'Người dùng này sẽ có thể đăng nhập trở lại sau khi được mở khóa.'
                                }
                            </p>
                        </div>
                        <div className="modal-footer justify-center">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setShowLockConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={lockAction.currentStatus === 'active' ? 'btn-lock-confirm' : 'btn-unlock-confirm'}
                                onClick={handleLockToggle}
                            >
                                <i className={`bi ${lockAction.currentStatus === 'active' ? 'bi-lock' : 'bi-unlock'}`}></i>
                                {lockAction.currentStatus === 'active' ? 'Khóa' : 'Mở khóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
