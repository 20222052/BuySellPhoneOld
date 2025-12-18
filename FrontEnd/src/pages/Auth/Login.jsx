import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, clearSuccess } from "../../store/slices/authSlice";
import { Toast } from "react-bootstrap";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import '../../assets/css/home/Auth/Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Show toast on error or success
  useEffect(() => {
    if (error || success) {
      setShowToast(true);
    }
  }, [error, success]);

  // Clear messages after toast closes
  useEffect(() => {
    if (!showToast) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showToast, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      // Navigate based on user role
      console.log("Login successful:", result);
      // if (result.user?.role === "admin") {
      //   navigate("/admin");
      // } else {
      //   navigate("/");
      // }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        {/* Toast Notification */}
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            bg={error ? "danger" : "success"}
          >
            <Toast.Header closeButton>
              <i className={`bi bi-${error ? "exclamation-circle" : "check-circle"} me-2`}></i>
              <strong className="me-auto">{error ? "Lỗi" : "Thành công"}</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {error || success}
            </Toast.Body>
          </Toast>
        </div>

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
