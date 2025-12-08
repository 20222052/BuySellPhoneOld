import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../../assets/css/home/Auth/Register.css';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        if (!acceptTerms) {
            alert("Vui lòng đồng ý với điều khoản!");
            return;
        }

        // Navigate to OTP verification
        navigate("/otp-register");
    };

    return (
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

                                <button type="submit" className="btn-submit">
                                    <span>Đăng Ký</span>
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </form>

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
    );
}