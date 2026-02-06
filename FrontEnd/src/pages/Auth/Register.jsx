import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AuthService from "../../services/AuthService";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { loginGoogle } from "../../store/slices/authSlice";
import { RoutePaths } from "../../routes/RoutePaths";
import '../../assets/css/home/Auth/Register.css';

export default function Register() {
    const location = useLocation();
    // Nhận lại formData từ OTPRegister nếu quay lại
    const savedFormData = location.state?.formData;

    const [formData, setFormData] = useState(savedFormData || {
        fullName: "",
        gender: "",
        birthDate: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Dispatch action with the ACCESS TOKEN
                const result = await dispatch(loginGoogle(tokenResponse.access_token)).unwrap();
                console.log("Google register/login success:", result);

                // Redirect based on role (similar to Login logic)
                if (result.isAdmin) {
                    navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
                } else {
                    navigate(RoutePaths.HOME, { replace: true });
                }
            } catch (err) {
                console.error("Google register error:", err);
                toast.error(err.message || "Đăng nhập Google thất bại");
            }
        },
        onError: (error) => {
            console.log("Google Login Failed:", error);
            toast.error("Đăng nhập Google thất bại");
        }
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu không khớp!");
            return;
        }

        if (!acceptTerms) {
            toast.error("Vui lòng đồng ý với điều khoản!");
            return;
        }

        setIsLoading(true);

        try {
            // Format birthDate từ YYYY-MM-DD sang DD/MM/YYYY
            const formatBirthDate = (dateString) => {
                if (!dateString) return "";
                const [year, month, day] = dateString.split("-");
                return `${day}/${month}/${year}`;
            };

            // Gọi API đăng ký
            const userData = {
                fullName: formData.fullName,
                gender: formData.gender,
                birthDate: formatBirthDate(formData.birthDate),
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

            const response = await AuthService.register(userData);
            console.log("Register success:", response);

            // Navigate to OTP verification với email và formData
            navigate("/otp-register", {
                state: {
                    email: formData.email,
                    formData: formData,
                    message: response.message || "Mã OTP đã được gửi đến email của bạn"
                }
            });
        } catch (err) {
            console.error("Register error:", err);
            toast.error(err.message || "Đăng ký thất bại. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="auth-container">
                <div className="auth-wrapper">
                    <div className="auth-card register-card">
                        {/* Left Side - Form */}
                        <div className="auth-form-container">
                            <div className="auth-form-wrapper">
                                <div className="auth-header">
                                    <h3>Đăng Ký</h3>
                                    <p>Tạo tài khoản mới để bắt đầu</p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="form-group">
                                        <label htmlFor="fullName" className="form-label">
                                            <i className="bi bi-person me-2"></i>
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Nhập họ và tên"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group form-group-half">
                                            <label htmlFor="gender" className="form-label">
                                                <i className="bi bi-gender-ambiguous me-2"></i>
                                                Giới tính
                                            </label>
                                            <select
                                                className="form-control"
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Chọn giới tính</option>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>

                                        <div className="form-group form-group-half">
                                            <label htmlFor="birthDate" className="form-label">
                                                <i className="bi bi-calendar me-2"></i>
                                                Ngày sinh
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="birthDate"
                                                name="birthDate"
                                                value={formData.birthDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            <i className="bi bi-envelope me-2"></i>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Nhập email"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone" className="form-label">
                                            <i className="bi bi-telephone me-2"></i>
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại"
                                            required
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
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Nhập mật khẩu"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            <i className="bi bi-lock-fill me-2"></i>
                                            Xác nhận mật khẩu
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập lại mật khẩu"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-check-custom">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="terms"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="terms">
                                            Tôi đồng ý với{" "}
                                            <Link to="/terms" className="terms-link">
                                                Điều khoản sử dụng
                                            </Link>{" "}
                                            và{" "}
                                            <Link to="/privacy" className="terms-link">
                                                Chính sách bảo mật
                                            </Link>
                                        </label>
                                    </div>

                                    <button type="submit" className="btn-submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Đăng Ký</span>
                                                <i className="bi bi-arrow-right"></i>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-divider">
                                    <span>Hoặc đăng ký với</span>
                                </div>

                                <div className="social-login">
                                    <button className="social-btn google" disabled={isLoading} onClick={() => handleGoogleLogin()}>
                                        <i className="bi bi-google"></i>
                                        Google
                                    </button>
                                </div>

                                <div className="auth-footer">
                                    <p>
                                        Đã có tài khoản?{" "}
                                        <Link to="/login" className="auth-link">
                                            Đăng nhập ngay
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Image/Branding */}
                        <div className="auth-side-image">
                            <div className="auth-overlay">
                                <div className="auth-brand">
                                    <i className="bi bi-phone"></i>
                                    <h2>BuySellPhoneOld</h2>
                                    <p>Tham gia cộng đồng mua bán điện thoại cũ uy tín</p>
                                    <ul className="feature-list">
                                        <li><i className="bi bi-check-circle"></i> Sản phẩm chất lượng</li>
                                        <li><i className="bi bi-check-circle"></i> Giá cả hợp lý</li>
                                        <li><i className="bi bi-check-circle"></i> Bảo hành chu đáo</li>
                                    </ul>
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