import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RoutePaths } from '../../../routes/RoutePaths';

const menuItems = [
    {
        section: 'TỔNG QUAN',
        items: [
            {
                title: 'Dashboard',
                icon: 'bi-grid-1x2-fill',
                path: RoutePaths.ADMIN_DASHBOARD,
                badge: null,
            },
        ],
    },
    {
        section: 'QUẢN LÝ',
        items: [
            {
                title: 'Danh mục',
                icon: 'bi-folder-fill',
                path: RoutePaths.ADMIN_CATEGORIES,
                badge: null,
            },
            {
                title: 'Hãng sản xuất',
                icon: 'bi-building',
                path: RoutePaths.ADMIN_BRANDS,
                badge: null,
            },
            {
                title: 'Sản phẩm',
                icon: 'bi-box-seam-fill',
                path: RoutePaths.ADMIN_PRODUCTS,
                badge: null,
            },
            {
                title: 'Biến thể',
                icon: 'bi-collection-fill',
                path: RoutePaths.ADMIN_VARIANTS,
                badge: null,
            },
            {
                title: 'Bài viết',
                icon: 'bi-journal-text',
                path: RoutePaths.ADMIN_BLOGS,
                badge: null,
            },

            {
                title: 'Đơn hàng',
                icon: 'bi-cart-check-fill',
                path: '/admin/orders',
                badge: '5',
                children: [
                    { title: 'Tất cả đơn hàng', path: '/admin/orders' },
                    { title: 'Chờ xác nhận', path: '/admin/orders/pending' },
                    { title: 'Đang giao', path: '/admin/orders/shipping' },
                    { title: 'Hoàn thành', path: '/admin/orders/completed' },
                ],
            },
            {
                title: 'Người dùng',
                icon: 'bi-people-fill',
                path: RoutePaths.ADMIN_USERS,
                badge: null,
            },
            {
                title: 'Hỗ trợ chat',
                icon: 'bi-chat-dots-fill',
                path: RoutePaths.ADMIN_CHAT,
                badge: null,
                children: [
                    { title: 'Chat trực tiếp', path: RoutePaths.ADMIN_CHAT },
                    { title: 'Lịch sử chat', path: RoutePaths.ADMIN_CHAT_HISTORY },
                ],
            },
        ],
    },
    {
        section: 'THỐNG KÊ',
        items: [
            {
                title: 'Báo cáo',
                icon: 'bi-bar-chart-fill',
                path: '/admin/reports',
                badge: null,
                children: [
                    { title: 'Doanh thu', path: '/admin/reports/revenue' },
                    { title: 'Sản phẩm bán chạy', path: '/admin/reports/top-products' },
                    { title: 'Khách hàng', path: '/admin/reports/customers' },
                ],
            },
        ],
    },
    {
        section: 'TÀI KHOẢN',
        items: [
            {
                title: 'Thông tin tài khoản',
                icon: 'bi-person-circle',
                path: '/admin/account',
                badge: null,
            },
        ],
    },
];

export default function AdminSidebar({ isCollapsed, isMobileOpen, onToggle }) {
    const location = useLocation();

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
            {/* Logo */}
            <div className="sidebar-header">
                <NavLink to={RoutePaths.ADMIN_DASHBOARD} className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <i className="bi bi-phone"></i>
                    </div>
                    <span className="sidebar-logo-text">PhoneOld</span>
                </NavLink>
            </div>

            {/* Menu */}
            <nav className="sidebar-menu">
                {menuItems.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="menu-section">
                        <div className="menu-section-title">{section.section}</div>
                        {section.items.map((item, itemIdx) => (
                            <MenuItem
                                key={itemIdx}
                                item={item}
                                isActive={location.pathname === item.path}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}

function MenuItem({ item, isActive, isCollapsed }) {
    const location = useLocation();
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive = hasChildren && item.children.some(
        child => location.pathname === child.path
    );

    if (hasChildren) {
        return (
            <MenuItemWithChildren
                item={item}
                isActive={isActive || isChildActive}
                isCollapsed={isCollapsed}
            />
        );
    }

    return (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
            }
        >
            <span className="menu-icon">
                <i className={`bi ${item.icon}`}></i>
            </span>
            <span className="menu-text">{item.title}</span>
            {item.badge && <span className="menu-badge">{item.badge}</span>}
        </NavLink>
    );
}

function MenuItemWithChildren({ item, isActive, isCollapsed }) {
    const [isOpen, setIsOpen] = useState(isActive);
    const location = useLocation();

    return (
        <div className="menu-item-wrapper">
            <div
                className={`menu-item menu-item-has-children ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="menu-icon">
                    <i className={`bi ${item.icon}`}></i>
                </span>
                <span className="menu-text">{item.title}</span>
                <span className="menu-arrow">
                    <i className="bi bi-chevron-right"></i>
                </span>
            </div>
            <div className={`submenu ${isOpen && !isCollapsed ? 'open' : ''}`}>
                {item.children.map((child, idx) => (
                    <NavLink
                        key={idx}
                        to={child.path}
                        className={({ isActive }) =>
                            `submenu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        {child.title}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
