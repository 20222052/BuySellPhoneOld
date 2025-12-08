import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../../assets/css/home/Auth/ResetPassword.css';

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

        if (formData.password.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        // Reset password logic here
        alert("Đặt lại mật khẩu thành công!");
        navigate("/login");
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card reset-card">
                    <div className="auth-form-container full-width">
                        <div className="auth-form-wrapper">
                            <div className="reset-icon">
                                <i className="bi bi-shield-lock"></i>
                            </div>

                            <div className="auth-header">
                                <h3>Đặt Lại Mật Khẩu</h3>
                                <p>Nhập mật khẩu mới của bạn</p>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-lock me-2"></i>
                                        Mật khẩu mới
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                            minLength="6"
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
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                            minLength="6"
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

                                <div className="password-requirements">
                                    <p className="requirements-title">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Yêu cầu mật khẩu:
                                    </p>
                                    <ul>
                                        <li className={formData.password.length >= 6 ? 'valid' : ''}>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Ít nhất 6 ký tự
                                        </li>
                                        <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Có chữ hoa
                                        </li>
                                        <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Có số
                                        </li>
                                    </ul>
                                </div>

                                <button type="submit" className="btn-submit">
                                    <span>Đặt Lại Mật Khẩu</span>
                                    <i className="bi bi-check-lg"></i>
                                </button>
                            </form>

                            <div className="auth-footer">
                                <Link to="/login" className="back-link">
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}