import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AuthService from "../../services/AuthService";
import '../../assets/css/home/Auth/FogotPassWord.css';

export default function ForgotPassword() {
    const location = useLocation();
    // Nhận lại email/password từ OTPForgot nếu quay lại
    const savedEmail = location.state?.email || "";
    const savedPassword = location.state?.password || "";

    const [email, setEmail] = useState(savedEmail);
    const [password, setPassword] = useState(savedPassword);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);

        try {
            // Gọi API forgot-password
            const response = await AuthService.forgotPassword(email, password);
            console.log("Forgot password success:", response);

            setIsSubmitted(true);

            // Chuyển đến trang OTP sau 2 giây
            setTimeout(() => {
                navigate("/otp-forgot", {
                    state: {
                        email: email,
                        password: password,
                        message: response.message || "Mã OTP đã được gửi đến email của bạn"
                    }
                });
            }, 2000);
        } catch (err) {
            console.error("Forgot password error:", err);
            toast.error(err.message || "Gửi yêu cầu thất bại. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
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
                                                    Mật khẩu mới
                                                </label>
                                                <div className="password-input-wrapper">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        className="form-control"
                                                        id="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="Nhập mật khẩu mới"
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

                                            <button type="submit" className="btn-submit" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        <span>Đang gửi...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Gửi Mã Xác Thực</span>
                                                        <i className="bi bi-arrow-right"></i>
                                                    </>
                                                )}
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
            <Footer />
        </>
    );
}