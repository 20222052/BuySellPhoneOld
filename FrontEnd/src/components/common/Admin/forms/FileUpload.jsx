import { useState, useRef, forwardRef } from 'react';

/**
 * FileUpload Component - Upload file đơn
 * @param {string} label - Nhãn
 * @param {string} accept - Loại file chấp nhận
 * @param {number} maxSize - Kích thước tối đa (MB)
 */
const FileUpload = forwardRef(({
    label,
    accept,
    maxSize = 5,
    onChange,
    error,
    disabled = false,
    className = '',
    placeholder = 'Chọn tệp',
    hint,
    required = false,
    ...props
}, ref) => {
    const [fileName, setFileName] = useState('');
    const inputRef = useRef(null);

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
                alert(`Kích thước file không được vượt quá ${maxSize}MB`);
                return;
            }
            setFileName(file.name);
            onChange && onChange(file);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setFileName('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onChange && onChange(null);
    };

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div
                className={`file-upload-wrapper ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={handleClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    disabled={disabled}
                    {...props}
                />
                <div className="file-upload-content">
                    <span className="file-upload-text">
                        {fileName || placeholder}
                    </span>
                    <div className="file-upload-actions">
                        {fileName && (
                            <button type="button" className="file-clear" onClick={handleClear}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                        <span className="file-upload-btn">Chọn tệp</span>
                    </div>
                </div>
            </div>
            {error && <span className="form-feedback error">{error}</span>}
            {hint && !error && <span className="form-hint">{hint}</span>}
        </div>
    );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
