import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import AuthService from "../../services/AuthService";
import '../../assets/css/home/Auth/OTPFogot.css';

export default function OTPForgot() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy email và password từ state được truyền từ trang ForgotPassword
    const email = location.state?.email || "";
    const password = location.state?.password || "";
    const message = location.state?.message || "";

    // Redirect nếu không có email
    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    // Hiển thị message thành công khi vào trang
    useEffect(() => {
        if (message) {
            toast.success(message);
        }
    }, [message]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            toast.error("Vui lòng nhập đầy đủ mã OTP!");
            return;
        }

        setIsLoading(true);

        try {
            // Gọi API xác thực OTP quên mật khẩu
            await AuthService.forgotPasswordConfirmOTP(email, otpCode);

            toast.success("Đặt lại mật khẩu thành công!");

            // Thành công -> chuyển đến trang login
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error("Verify OTP error:", err);
            toast.error(err.message || "Mã OTP không đúng. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);

        try {
            // Gọi lại API forgot-password để gửi lại OTP
            if (email && password) {
                await AuthService.forgotPassword(email, password);
                toast.success("Mã OTP mới đã được gửi!");
            }

            setTimer(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
        } catch (err) {
            console.error("Resend OTP error:", err);
            toast.error(err.message || "Không thể gửi lại mã OTP!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="auth-container">
                <div className="auth-wrapper">
                    <div className="auth-card otp-card">
                        <div className="auth-form-container full-width">
                            <div className="auth-form-wrapper">
                                <div className="otp-icon">
                                    <i className="bi bi-key-fill"></i>
                                </div>

                                <div className="auth-header">
                                    <h3>Xác Thực OTP</h3>
                                    <p>Nhập mã OTP để đặt lại mật khẩu</p>
                                    {email && <p className="email-display"><strong>{email}</strong></p>}
                                </div>

                                <form onSubmit={handleSubmit} className="otp-form">
                                    <div className="otp-inputs">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                maxLength="1"
                                                className="otp-input"
                                                value={digit}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="otp-timer">
                                        {!canResend ? (
                                            <p>
                                                Mã sẽ hết hạn sau{" "}
                                                <span className="timer-count">{timer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                className="resend-btn"
                                                onClick={handleResend}
                                            >
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Gửi lại mã
                                            </button>
                                        )}
                                    </div>

                                    <button type="submit" className="btn-submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                <span>Đang xác thực...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Xác Nhận</span>
                                                <i className="bi bi-check-lg"></i>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-footer">
                                    <button
                                        type="button"
                                        className="back-link"
                                        onClick={() => navigate("/forgot-password", { state: { email, password } })}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Quay lại
                                    </button>
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