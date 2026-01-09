import { forwardRef } from 'react';

/**
 * FormTextarea Component - Textarea với character count
 * @param {string} label - Nhãn
 * @param {number} rows - Số hàng
 * @param {number} maxLength - Độ dài tối đa
 * @param {boolean} showCount - Hiển thị đếm ký tự
 * @param {boolean} resize - Cho phép resize
 */
const FormTextarea = forwardRef(({
    label,
    placeholder = 'Nhập nội dung...',
    rows = 4,
    maxLength,
    showCount = false,
    resize = true,
    error,
    success,
    disabled = false,
    hint,
    className = '',
    required = false,
    value = '',
    onChange,
    ...props
}, ref) => {
    const charCount = value?.length || 0;

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="textarea-wrapper">
                <textarea
                    ref={ref}
                    className={`admin-textarea ${error ? 'input-error' : ''} ${success ? 'input-success' : ''}`}
                    placeholder={placeholder}
                    rows={rows}
                    maxLength={maxLength}
                    disabled={disabled}
                    style={{ resize: resize ? 'vertical' : 'none' }}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {showCount && maxLength && (
                    <span className="textarea-count">
                        {charCount}/{maxLength}
                    </span>
                )}
            </div>
            {error && <span className="form-feedback error">{error}</span>}
            {success && <span className="form-feedback success">{success}</span>}
            {hint && !error && !success && <span className="form-hint">{hint}</span>}
        </div>
    );
});

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
