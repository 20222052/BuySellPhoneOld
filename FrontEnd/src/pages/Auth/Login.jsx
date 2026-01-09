import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, clearSuccess } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { RoutePaths } from "../../routes/RoutePaths";
import '../../assets/css/home/Auth/Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  // Lấy đường dẫn trước đó để redirect sau khi đăng nhập
  const from = location.state?.from?.pathname || RoutePaths.HOME;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Nếu là admin, redirect về trang admin dashboard
      if (isAdmin) {
        navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
      } else {
        // Nếu là user thường, redirect về trang trước đó hoặc trang chủ
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  // Show toast on error or success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  // Hiển thị message từ trang khác (ví dụ: đăng ký thành công)
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      toast.success(message);
      // Xóa message khỏi state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      // Navigate based on user role
      console.log("Login successful:", result);

      if (result.isAdmin) {
        // Nếu là admin, redirect về trang admin dashboard
        navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
      } else {
        // Nếu là user thường, redirect về trang trước đó hoặc trang chủ
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-card">
            {/* Left Side - Image/Branding */}
            <div className="auth-side-image">
              <div className="auth-overlay">
                <div className="auth-brand">
                  <i className="bi bi-phone"></i>
                  <h2>BuySellPhoneOld</h2>
                  <p>Chào mừng trở lại! Đăng nhập để tiếp tục</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
              <div className="auth-form-wrapper">
                <div className="auth-header">
                  <h3>Đăng Nhập</h3>
                  <p>Chào mừng bạn quay trở lại</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock me-2"></i>
                      Mật khẩu
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <Link to="/forgot-password" className="forgot-link">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <span>Đang đăng nhập...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng Nhập</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>Hoặc đăng nhập với</span>
                </div>

                <div className="social-login">
                  <button className="social-btn google" disabled={loading}>
                    <i className="bi bi-google"></i>
                    Google
                  </button>
                  <button className="social-btn facebook" disabled={loading}>
                    <i className="bi bi-facebook"></i>
                    Facebook
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="auth-link">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
