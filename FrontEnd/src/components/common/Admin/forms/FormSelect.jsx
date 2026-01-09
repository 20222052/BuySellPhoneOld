import { useState, useRef, useEffect, forwardRef } from 'react';

/**
 * FormSelect Component - Select dropdown với search
 * @param {string} label - Nhãn
 * @param {Array} options - Mảng options [{value, label, icon?}]
 * @param {string} placeholder - Placeholder
 * @param {boolean} searchable - Có thể tìm kiếm
 * @param {boolean} multiple - Chọn nhiều
 * @param {boolean} clearable - Có thể xóa selection
 */
const FormSelect = forwardRef(({
    label,
    options = [],
    placeholder = 'Chọn một tùy chọn',
    value,
    onChange,
    error,
    disabled = false,
    searchable = false,
    multiple = false,
    clearable = false,
    className = '',
    required = false,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);
    const searchRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchable && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen, searchable]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const getSelectedLabel = () => {
        if (multiple && Array.isArray(value) && value.length > 0) {
            if (value.length === 1) {
                const opt = options.find(o => o.value === value[0]);
                return opt?.label;
            }
            return `${value.length} đã chọn`;
        }
        const selected = options.find(opt => opt.value === value);
        return selected?.label;
    };

    const handleSelect = (optValue) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optValue)
                ? currentValues.filter(v => v !== optValue)
                : [...currentValues, optValue];
            onChange && onChange(newValues);
        } else {
            onChange && onChange(optValue);
            setIsOpen(false);
            setSearch('');
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange && onChange(multiple ? [] : '');
    };

    const isSelected = (optValue) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(optValue);
        }
        return value === optValue;
    };

    const hasValue = multiple
        ? Array.isArray(value) && value.length > 0
        : value !== undefined && value !== '';

    return (
        <div className={`form-group ${className}`} ref={wrapperRef}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div
                className={`admin-select ${isOpen ? 'open' : ''} ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="select-value">
                    {hasValue ? (
                        <span className="selected-text">{getSelectedLabel()}</span>
                    ) : (
                        <span className="placeholder-text">{placeholder}</span>
                    )}
                </div>
                <div className="select-actions">
                    {clearable && hasValue && (
                        <button type="button" className="select-clear" onClick={handleClear}>
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                    <span className="select-arrow">
                        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="select-dropdown animate-fade-in">
                    {searchable && (
                        <div className="select-search">
                            <i className="bi bi-search"></i>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="select-options">
                        {filteredOptions.length === 0 ? (
                            <div className="select-empty">Không tìm thấy kết quả</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`select-option ${isSelected(opt.value) ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(opt.value);
                                    }}
                                >
                                    {multiple && (
                                        <span className={`option-checkbox ${isSelected(opt.value) ? 'checked' : ''}`}>
                                            {isSelected(opt.value) && <i className="bi bi-check"></i>}
                                        </span>
                                    )}
                                    {opt.icon && <span className="option-icon">{opt.icon}</span>}
                                    <span className="option-label">{opt.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
