import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../../assets/css/home/Auth/FogotPassWord.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (email) {
            setIsSubmitted(true);
            setTimeout(() => {
                navigate("/otp-forgot");
            }, 2000);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-card forgot-card">
                    <div className="auth-form-container full-width">
                        <div className="auth-form-wrapper">
                            {!isSubmitted ? (
                                <>
                                    <div className="forgot-icon">
                                        <i className="bi bi-lock-fill"></i>
                                    </div>
                                    <div className="auth-header">
                                        <h3>Quên Mật Khẩu?</h3>
                                        <p>Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã xác thực</p>
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
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="form-label">
                                                <i className="bi bi-lock me-2"></i>
                                                Mật khẩu
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Nhập mật khẩu"
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn-submit">
                                            <span>Gửi Mã Xác Thực</span>
                                            <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </form>

                                    <div className="auth-footer">
                                        <Link to="/login" className="back-link">
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Quay lại đăng nhập
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="success-message">
                                    <div className="success-icon">
                                        <i className="bi bi-check-circle"></i>
                                    </div>
                                    <h3>Email Đã Được Gửi!</h3>
                                    <p>Vui lòng kiểm tra email của bạn để nhận mã xác thực</p>
                                    <div className="loader"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}