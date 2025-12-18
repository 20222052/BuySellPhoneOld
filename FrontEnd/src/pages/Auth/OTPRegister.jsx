import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import '../../assets/css/home/Auth/OTPRegister.css';

export default function OTPRegister() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

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

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpCode = otp.join("");

        if (otpCode.length === 6) {
            // Verify OTP
            navigate("/login");
        }
    };

    const handleResend = () => {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
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
                                    <i className="bi bi-shield-check"></i>
                                </div>

                                <div className="auth-header">
                                    <h3>Xác Thực OTP</h3>
                                    <p>Nhập mã OTP đã được gửi đến email của bạn</p>
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

                                    <button type="submit" className="btn-submit">
                                        <span>Xác Nhận</span>
                                        <i className="bi bi-check-lg"></i>
                                    </button>
                                </form>

                                <div className="auth-footer">
                                    <Link to="/register" className="back-link">
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Quay lại đăng ký
                                    </Link>
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