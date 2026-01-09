import { forwardRef } from 'react';

/**
 * FormInput Component - Input cơ bản với nhiều variants
 * @param {string} label - Nhãn input
 * @param {string} type - Loại input (text, email, password, number, date, time, ...)
 * @param {string} placeholder - Placeholder
 * @param {string} error - Thông báo lỗi
 * @param {string} success - Thông báo thành công
 * @param {boolean} disabled - Vô hiệu hóa
 * @param {string} hint - Gợi ý
 * @param {React.ReactNode} leftIcon - Icon bên trái
 * @param {React.ReactNode} rightIcon - Icon bên phải
 * @param {string} size - Kích thước (sm, md, lg)
 */
const FormInput = forwardRef(({
    label,
    type = 'text',
    placeholder,
    error,
    success,
    disabled = false,
    hint,
    leftIcon,
    rightIcon,
    size = 'md',
    className = '',
    required = false,
    ...props
}, ref) => {
    const getInputClass = () => {
        let classes = `admin-input admin-input-${size}`;
        if (error) classes += ' input-error';
        if (success) classes += ' input-success';
        if (disabled) classes += ' input-disabled';
        if (leftIcon) classes += ' has-left-icon';
        if (rightIcon) classes += ' has-right-icon';
        return classes;
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
                {leftIcon && <span className="input-icon left">{leftIcon}</span>}
                <input
                    ref={ref}
                    type={type}
                    className={getInputClass()}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...props}
                />
                {rightIcon && <span className="input-icon right">{rightIcon}</span>}
            </div>
            {error && <span className="form-feedback error">{error}</span>}
            {success && <span className="form-feedback success">{success}</span>}
            {hint && !error && !success && <span className="form-hint">{hint}</span>}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
