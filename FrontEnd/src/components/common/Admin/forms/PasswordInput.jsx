import { useState, forwardRef } from 'react';

/**
 * PasswordInput Component - Input mật khẩu với toggle visibility
 * @param {string} label - Nhãn input
 * @param {string} placeholder - Placeholder
 * @param {string} error - Thông báo lỗi
 * @param {boolean} showStrength - Hiển thị độ mạnh mật khẩu
 */
const PasswordInput = forwardRef(({
    label,
    placeholder = 'Nhập mật khẩu',
    error,
    success,
    disabled = false,
    showStrength = false,
    className = '',
    required = false,
    value,
    onChange,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const calculateStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;
        return score;
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        if (showStrength) {
            setStrength(calculateStrength(newValue));
        }
        onChange && onChange(e);
    };

    const getStrengthText = () => {
        const texts = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
        return texts[strength];
    };

    const getStrengthColor = () => {
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
        return colors[strength];
    };

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                <input
                    ref={ref}
                    type={showPassword ? 'text' : 'password'}
                    className={`admin-input has-right-icon ${error ? 'input-error' : ''} ${success ? 'input-success' : ''}`}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={value}
                    onChange={handleChange}
                    {...props}
                />
                <button
                    type="button"
                    className="input-icon right clickable"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
            </div>

            {showStrength && value && (
                <div className="password-strength">
                    <div className="strength-bars">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`strength-bar ${i < strength ? 'active' : ''}`}
                                style={{ backgroundColor: i < strength ? getStrengthColor() : undefined }}
                            />
                        ))}
                    </div>
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                        {getStrengthText()}
                    </span>
                </div>
            )}

            {error && <span className="form-feedback error">{error}</span>}
            {success && <span className="form-feedback success">{success}</span>}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
