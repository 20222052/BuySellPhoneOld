import { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Container, Badge, Dropdown, Form } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../assets/css/home/Header.css';

import ProductItemService from "../../services/productItemService";
import { fetchCart } from "../../store/slices/cartSlice";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, isAuthenticated, user]);

  const cartCount = totalItems;

  useEffect(() => {
    // Close search dropdown on outside click
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const response = await ProductItemService.getAllForList({ search: searchQuery, pageSize: 5 });
        if (response && response.data) {
          setSearchResults(response.data.items || []);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 80) {
        if (window.scrollY > lastScrollY.current) {
          setHideNav(true); // scroll down
        } else {
          setHideNav(false); // scroll up
        }
        lastScrollY.current = window.scrollY;
      } else {
        setHideNav(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar
      expand="lg"
      className={`header-navbar ${scrolled ? 'scrolled' : ''} ${hideNav ? 'nav-hide' : ''}`}
      sticky="top"
      style={{ transition: 'transform 0.5s' }}
    >
      <Container>
        {/* Logo/Brand */}
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <i className=""><img src="/logo.png" width="70" alt="PhoneZin Logo" /></i>
          <span className="brand-text">PhoneZin</span>
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="navbar-nav">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="navbar-nav">
          {/* Center Navigation */}
          <Nav className="mx-auto d-none d-lg-flex align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
            >
              <i className="bi bi-house-door me-1"></i>
              Trang Chủ
            </Nav.Link>

            {/* Products Dropdown */}
            <Dropdown className="nav-dropdown">
              <Dropdown.Toggle
                variant="link"
                className={`nav-link-custom ${location.pathname.startsWith('/products') ? 'active' : ''}`}
              >
                <i className="bi bi-grid me-1"></i>
                Sản Phẩm
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/products">
                  <i className="bi bi-phone me-2"></i>
                  Tất Cả Sản Phẩm
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/products/iphone">
                  <i className="bi bi-apple me-2"></i>
                  iPhone
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/samsung">
                  <i className="bi bi-phone me-2"></i>
                  Samsung
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/xiaomi">
                  <i className="bi bi-phone me-2"></i>
                  Xiaomi
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/oppo">
                  <i className="bi bi-phone me-2"></i>
                  OPPO
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/vivo">
                  <i className="bi bi-phone me-2"></i>
                  Vivo
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Blog Dropdown */}
            <Dropdown className="nav-dropdown">
              <Dropdown.Toggle
                variant="link"
                className={`nav-link-custom ${location.pathname.startsWith('/blog') ? 'active' : ''}`}
              >
                <i className="bi bi-newspaper me-1"></i>
                Tin Tức
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/blogs">
                  <i className="bi bi-newspaper me-2"></i>
                  Tất Cả Bài Viết
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/blogs/tech-news">
                  <i className="bi bi-lightning me-2"></i>
                  Tin Công Nghệ
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/reviews">
                  <i className="bi bi-star me-2"></i>
                  Đánh Giá
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/tips-tricks">
                  <i className="bi bi-lightbulb me-2"></i>
                  Mẹo Hay
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/buying-guide">
                  <i className="bi bi-book me-2"></i>
                  Hướng Dẫn Mua
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/comparisons">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  So Sánh
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link
              as={Link}
              to="/tradein"
              className={`nav-link-custom ${isActive('/tradein') ? 'active' : ''}`}
            >
              <i className="bi bi-arrow-repeat me-1"></i>
              Thu Cũ Đổi Mới
            </Nav.Link>
          </Nav>

          {/* Mobile Navigation */}
          <Nav className="d-lg-none">
            <Nav.Link as={Link} to="/" className="mobile-nav-link">
              <i className="bi bi-house-door me-2"></i>Trang Chủ
            </Nav.Link>

            {/* Mobile Products Dropdown */}
            <Dropdown className="w-100">
              <Dropdown.Toggle variant="link" className="mobile-nav-link w-100">
                <i className="bi bi-grid me-2"></i>Sản Phẩm
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item as={Link} to="/products">Tất Cả Sản Phẩm</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/products/iphone">iPhone</Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/samsung">Samsung</Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/xiaomi">Xiaomi</Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/oppo">OPPO</Dropdown.Item>
                <Dropdown.Item as={Link} to="/products/vivo">Vivo</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Mobile Blog Dropdown */}
            <Dropdown className="w-100">
              <Dropdown.Toggle variant="link" className="mobile-nav-link w-100">
                <i className="bi bi-newspaper me-2"></i>Tin Tức
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item as={Link} to="/blogs">Tất Cả Bài Viết</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/blogs/tech-news">Tin Công Nghệ</Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/reviews">Đánh Giá</Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/tips-tricks">Mẹo Hay</Dropdown.Item>
                <Dropdown.Item as={Link} to="/blogs/buying-guide">Hướng Dẫn Mua</Dropdown.Item>
                <Dropdown.Item as={Link} to="/blog/comparisons">So Sánh</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link as={Link} to="/tradein" className="mobile-nav-link">
              <i className="bi bi-arrow-repeat me-2"></i>Thu Cũ Đổi Mới
            </Nav.Link>
            <hr className="my-2" />
          </Nav>

          {/* Right Side Actions */}
          <Nav className="ms-auto align-items-center">
            {/* Search Bar - Desktop */}
            <div className="search-container position-relative me-3 d-none d-lg-flex" ref={searchContainerRef}>
              <Form className="search-form w-100 d-flex" onSubmit={handleSearchSubmit}>
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                />
                <button className="search-btn" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </Form>

              {/* Search Dropdown */}
              {showDropdown && (
                <div
                  className="search-dropdown position-absolute w-100 bg-white shadow rounded mt-1 z-3 border"
                  style={{ top: '100%', left: 0, maxHeight: '400px', overflowY: 'auto', zIndex: 1050 }}
                >
                  {isSearching ? (
                    <div className="p-3 text-center text-muted">Đang tìm kiếm...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="list-group-item list-group-item-action d-flex align-items-center gap-2 border-0 border-bottom"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <img
                            src={product.primaryImageUrl || '/placeholder.png'}
                            alt={product.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div className="flex-grow-1 text-truncate">
                            <h6 className="mb-0 text-truncate fw-bold" style={{ fontSize: '13px' }}>
                              {product.productName} {product.name}
                            </h6>
                            <small className="text-danger fw-bold">{ProductItemService.formatPrice(product.sellPrice)}</small>
                          </div>
                        </Link>
                      ))}
                      <Link
                        to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                        className="p-2 text-center text-primary d-block fw-bold"
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery("");
                        }}
                        style={{ textDecoration: 'none', fontSize: '14px', backgroundColor: '#f8f9fa' }}
                      >
                        Xem tất cả {searchResults.length >= 5 ? 'kết quả' : ''} <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted">
                      Không tìm thấy "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Icon - Mobile */}
            <Nav.Link className="d-lg-none icon-link">
              <i className="bi bi-search fs-5"></i>
            </Nav.Link>

            {/* Cart */}
            <Nav.Link as={Link} to="/cart" className="cart-link position-relative">
              <i className="bi bi-cart3 fs-5"></i>
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  className="cart-badge position-absolute"
                  pill
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {/* User Dropdown or Login */}
            {isAuthenticated ? (
              <Dropdown align="end" className="user-dropdown">
                <Dropdown.Toggle variant="link" className="user-toggle">
                  <div className="user-avatar">
                    {user?.avatarUrl || user?.avatar ? (
                      <img src={user.avatarUrl || user.avatar} alt={user.name} className="avatar-img" />
                    ) : (
                      <i className="bi bi-person-circle fs-4"></i>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="user-menu">
                  <div className="user-info">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {user?.avatarUrl || user?.avatar ? (
                        <img src={user.avatarUrl || user.avatar} alt={user.name} className="avatar-img-small" />
                      ) : (
                        <div className="avatar-placeholder">
                          <i className="bi bi-person"></i>
                        </div>
                      )}
                      <div className="user-details">
                        <strong className="d-block">{user?.name || user?.fullName || 'User'}</strong>
                        <small className="text-muted">{user?.email}</small>
                      </div>
                    </div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i>
                    Thông Tin Cá Nhân
                  </Dropdown.Item>
                  {/* <Dropdown.Item as={Link} to="/orders">
                    <i className="bi bi-bag-check me-2"></i>
                    Đơn Hàng
                  </Dropdown.Item> */}
                  {/* <Dropdown.Item as={Link} to="/wishlist">
                    <i className="bi bi-heart me-2"></i>
                    Yêu Thích
                  </Dropdown.Item> */}
                  <Dropdown.Divider />
                  {/* <Dropdown.Item as={Link} to="/settings">
                    <i className="bi bi-gear me-2"></i>
                    Cài Đặt
                  </Dropdown.Item> */}
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng Xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn-login-link">
                <button className="btn-login">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Đăng Nhập
                </button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}