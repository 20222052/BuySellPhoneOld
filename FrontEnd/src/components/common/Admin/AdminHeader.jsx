import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../../store/slices/authSlice';
import { RoutePaths } from '../../../routes/RoutePaths';

export default function AdminHeader({ onToggleSidebar, isSidebarCollapsed }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);
    const searchInputRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lấy thông tin user từ Redux store
    const { user } = useSelector((state) => state.auth);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        function handleKeyDown(event) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
            if (event.key === 'Escape') {
                setShowNotifications(false);
                setShowUserMenu(false);
                searchInputRef.current?.blur();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = useCallback(async () => {
        await dispatch(logoutUser());
        navigate(RoutePaths.LOGIN);
    }, [dispatch, navigate]);

    const closeAllDropdowns = useCallback(() => {
        setShowNotifications(false);
        setShowUserMenu(false);
    }, []);

    const toggleNotifications = useCallback(() => {
        setShowUserMenu(false);
        setShowNotifications(prev => !prev);
    }, []);

    const toggleUserMenu = useCallback(() => {
        setShowNotifications(false);
        setShowUserMenu(prev => !prev);
    }, []);

    const notifications = [
        {
            id: 1,
            type: 'order',
            title: 'Đơn hàng mới #12345',
            message: 'Bạn có 1 đơn hàng mới cần xác nhận',
            time: '5 phút trước',
            icon: 'bi-bag-check-fill',
            color: 'primary',
            unread: true
        },
        {
            id: 2,
            type: 'user',
            title: 'Người dùng mới đăng ký',
            message: 'Nguyễn Văn A vừa tạo tài khoản',
            time: '15 phút trước',
            icon: 'bi-person-plus-fill',
            color: 'success',
            unread: true
        },
        {
            id: 3,
            type: 'warning',
            title: 'Sản phẩm sắp hết hàng',
            message: 'iPhone 15 Pro Max còn 2 sản phẩm',
            time: '1 giờ trước',
            icon: 'bi-exclamation-triangle-fill',
            color: 'warning',
            unread: false
        },
        {
            id: 4,
            type: 'review',
            title: 'Đánh giá 5 sao mới',
            message: 'Khách hàng vừa đánh giá sản phẩm',
            time: '2 giờ trước',
            icon: 'bi-star-fill',
            color: 'info',
            unread: false
        }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    // Avatar URL with fallback
    const avatarUrl = user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=3b82f6&color=fff&bold=true`;

    return (
        <header className="admin-header">
            {/* Left Section */}
            <div className="header-left">
                <button
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <i className={`bi bi-${isSidebarCollapsed ? 'list' : 'x-lg'}`}></i>
                </button>

                {/* <div className={`header-search ${searchFocused ? 'focused' : ''}`}>
                    <i className="bi bi-search header-search-icon"></i>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    <kbd className="header-search-shortcut">
                        <span>Ctrl</span>
                        <span>K</span>
                    </kbd>
                </div> */}
            </div>

            {/* Right Section */}
            <div className="header-right">
                {/* Quick Add Button */}
                {/* <button className="header-icon-btn" title="Thêm nhanh">
                    <i className="bi bi-plus-lg"></i>
                </button> */}

                {/* Messages */}
                {/* <button className="header-icon-btn" title="Tin nhắn">
                    <i className="bi bi-chat-dots"></i>
                    <span className="header-badge pulse">3</span>
                </button> */}

                {/* Notifications */}
                <div className="dropdown-wrapper" ref={notificationRef}>
                    {/* <button
                        className={`header-icon-btn ${showNotifications ? 'active' : ''}`}
                        onClick={toggleNotifications}
                        title="Thông báo"
                    >
                        <i className="bi bi-bell"></i>
                        {unreadCount > 0 && (
                            <span className="header-badge pulse">{unreadCount}</span>
                        )}
                    </button> */}

                    {/* <div className={`dropdown-menu notification-dropdown ${showNotifications ? 'show' : ''}`}>
                        <div className="dropdown-header">
                            <div className="dropdown-header-left">
                                <i className="bi bi-bell-fill"></i>
                                <h6>Thông báo</h6>
                                {unreadCount > 0 && (
                                    <span className="unread-count">{unreadCount} mới</span>
                                )}
                            </div>
                            <button className="mark-all-read">
                                <i className="bi bi-check2-all"></i>
                                Đã đọc
                            </button>
                        </div>

                        <div className="notification-list">
                            {notifications.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className={`notification-icon ${notification.color}`}>
                                        <i className={`bi ${notification.icon}`}></i>
                                    </div>
                                    <div className="notification-content">
                                        <h6>{notification.title}</h6>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            <i className="bi bi-clock"></i>
                                            {notification.time}
                                        </span>
                                    </div>
                                    {notification.unread && <span className="unread-dot"></span>}
                                </div>
                            ))}
                        </div>

                        <div className="dropdown-footer">
                            <Link to="/admin/notifications" onClick={closeAllDropdowns}>
                                <span>Xem tất cả thông báo</span>
                                <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                    </div> */}
                </div>

                <div className="header-divider"></div>

                {/* User Menu */}
                <div className="dropdown-wrapper user-dropdown-wrapper" ref={userMenuRef}>
                    <div
                        className={`admin-user-menu ${showUserMenu ? 'active' : ''}`}
                        onClick={toggleUserMenu}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleUserMenu()}
                    >
                        <div className="user-avatar-wrapper">
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="user-avatar"
                            />
                            <span className="status-indicator online"></span>
                        </div>
                        <div className="admin-user-info">
                            <span className="admin-user-name">{user?.fullName || 'Admin'}</span>
                            <span className="admin-user-role">
                                <i className="bi bi-shield-check"></i>
                                {user?.role || 'Administrator'}
                            </span>
                        </div>
                        <i className={`bi bi-chevron-down chevron ${showUserMenu ? 'rotate' : ''}`}></i>
                    </div>

                    <div className={`dropdown-menu admin-user-menu-dropdown ${showUserMenu ? 'show' : ''}`}>
                        {/* User Info Header */}
                        <div className="dropdown-user-header">
                            <div className="dropdown-user-avatar">
                                <img src={avatarUrl} alt="Avatar" />
                                {/* <span className="status-badge online">Online</span> */}
                            </div>
                            <div className="dropdown-user-details">
                                <h6>{user?.fullName || 'Admin'}</h6>
                                <p>{user?.email || 'admin@example.com'}</p>
                                <span className="user-role-badge">
                                    <i className="bi bi-star-fill"></i>
                                    {user?.role || 'Administrator'}
                                </span>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Account Section */}
                        <div className="dropdown-section">
                            <span className="dropdown-section-title">Tài khoản</span>
                            <Link to="/admin/account-info" className="dropdown-item" onClick={closeAllDropdowns}>
                                <div className="dropdown-item-icon primary">
                                    <i className="bi bi-person-badge"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Thông tin tài khoản</span>
                                    <span className="dropdown-item-desc">Xem và chỉnh sửa thông tin cá nhân</span>
                                </div>
                            </Link>
                            {/* <Link to="/admin/settings" className="dropdown-item" onClick={closeAllDropdowns}>
                                <div className="dropdown-item-icon secondary">
                                    <i className="bi bi-gear"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Cài đặt</span>
                                    <span className="dropdown-item-desc">Tùy chỉnh giao diện và thông báo</span>
                                </div>
                            </Link>
                            <Link to="/admin/security" className="dropdown-item" onClick={closeAllDropdowns}>
                                <div className="dropdown-item-icon warning">
                                    <i className="bi bi-shield-lock"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Bảo mật</span>
                                    <span className="dropdown-item-desc">Đổi mật khẩu và xác thực 2 bước</span>
                                </div>
                            </Link> */}
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Quick Links */}
                        <div className="dropdown-section">
                            <span className="dropdown-section-title">Liên kết nhanh</span>
                            <Link to="/" className="dropdown-item" onClick={closeAllDropdowns}>
                                <div className="dropdown-item-icon success">
                                    <i className="bi bi-house-door"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Về trang chủ</span>
                                    <span className="dropdown-item-desc">Xem website như khách hàng</span>
                                </div>
                            </Link>
                            <a href="#" className="dropdown-item" onClick={(e) => e.preventDefault()}>
                                <div className="dropdown-item-icon info">
                                    <i className="bi bi-book"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Hướng dẫn sử dụng</span>
                                    <span className="dropdown-item-desc">Tài liệu và hỗ trợ</span>
                                </div>
                                <i className="bi bi-box-arrow-up-right external-link"></i>
                            </a>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Logout */}
                        <div className="dropdown-section">
                            <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                <div className="dropdown-item-icon danger">
                                    <i className="bi bi-box-arrow-right"></i>
                                </div>
                                <div className="dropdown-item-content">
                                    <span className="dropdown-item-title">Đăng xuất</span>
                                    <span className="dropdown-item-desc">Thoát khỏi tài khoản admin</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
