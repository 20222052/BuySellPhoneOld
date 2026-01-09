import { useState, forwardRef } from 'react';

/**
 * DatePicker Component - Chọn ngày
 * @param {string} label - Nhãn
 * @param {string} type - date | datetime-local | time | month | week
 * @param {string} min - Ngày tối thiểu
 * @param {string} max - Ngày tối đa
 */
const DatePicker = forwardRef(({
    label,
    type = 'date',
    value,
    onChange,
    min,
    max,
    error,
    disabled = false,
    placeholder = 'Chọn ngày',
    className = '',
    required = false,
    ...props
}, ref) => {
    const getIcon = () => {
        switch (type) {
            case 'time':
                return 'bi-clock';
            case 'month':
            case 'week':
                return 'bi-calendar-month';
            default:
                return 'bi-calendar3';
        }
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
                    type={type}
                    className={`admin-input has-right-icon ${error ? 'input-error' : ''}`}
                    value={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                    disabled={disabled}
                    placeholder={placeholder}
                    {...props}
                />
                <span className="input-icon right">
                    <i className={`bi ${getIcon()}`}></i>
                </span>
            </div>
            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

/**
 * DateRangePicker Component - Chọn khoảng ngày
 */
export function DateRangePicker({
    label,
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    min,
    max,
    error,
    disabled = false,
    className = '',
    required = false,
}) {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="date-range-wrapper">
                <div className="input-wrapper">
                    <input
                        type="date"
                        className={`admin-input ${error ? 'input-error' : ''}`}
                        value={startDate}
                        onChange={onStartChange}
                        min={min}
                        max={endDate || max}
                        disabled={disabled}
                        placeholder="Từ ngày"
                    />
                </div>
                <span className="date-range-separator">đến</span>
                <div className="input-wrapper">
                    <input
                        type="date"
                        className={`admin-input ${error ? 'input-error' : ''}`}
                        value={endDate}
                        onChange={onEndChange}
                        min={startDate || min}
                        max={max}
                        disabled={disabled}
                        placeholder="Đến ngày"
                    />
                </div>
            </div>
            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
}
