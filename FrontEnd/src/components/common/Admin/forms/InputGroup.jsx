import { forwardRef } from 'react';

/**
 * InputGroup Component - Nhóm input với prefix/suffix
 * @param {string} label - Nhãn
 * @param {React.ReactNode} prefix - Phần đầu (icon, text, select)
 * @param {React.ReactNode} suffix - Phần cuối (icon, text, button)
 * @param {string} type - Loại input
 */
const InputGroup = forwardRef(({
    label,
    prefix,
    suffix,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    className = '',
    required = false,
    copyable = false,
    onCopy,
    ...props
}, ref) => {
    const handleCopy = () => {
        const value = props.value || props.defaultValue;
        if (value) {
            navigator.clipboard.writeText(value);
            onCopy && onCopy(value);
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
            <div className={`input-group-wrapper ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
                {prefix && <div className="input-group-addon prefix">{prefix}</div>}
                <input
                    ref={ref}
                    type={type}
                    className="admin-input input-group-input"
                    placeholder={placeholder}
                    disabled={disabled}
                    {...props}
                />
                {suffix && <div className="input-group-addon suffix">{suffix}</div>}
                {copyable && (
                    <button type="button" className="input-group-addon suffix copy-btn" onClick={handleCopy}>
                        <i className="bi bi-clipboard"></i> Copy
                    </button>
                )}
            </div>
            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
});

InputGroup.displayName = 'InputGroup';

export default InputGroup;

/**
 * PhoneInput Component - Input số điện thoại với country code
 */
export const PhoneInput = forwardRef(({
    label,
    countryCode = '+84',
    onCountryChange,
    error,
    className = '',
    required = false,
    ...props
}, ref) => {
    const countries = [
        { code: '+84', flag: '🇻🇳', name: 'VN' },
        { code: '+1', flag: '🇺🇸', name: 'US' },
        { code: '+44', flag: '🇬🇧', name: 'UK' },
        { code: '+81', flag: '🇯🇵', name: 'JP' },
        { code: '+82', flag: '🇰🇷', name: 'KR' },
        { code: '+86', flag: '🇨🇳', name: 'CN' },
    ];

    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    return (
        <InputGroup
            ref={ref}
            label={label}
            type="tel"
            placeholder="123-456-7890"
            error={error}
            className={className}
            required={required}
            prefix={
                <select
                    className="country-select"
                    value={countryCode}
                    onChange={(e) => onCountryChange && onCountryChange(e.target.value)}
                >
                    {countries.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.flag} {c.name}
                        </option>
                    ))}
                </select>
            }
            {...props}
        />
    );
});

PhoneInput.displayName = 'PhoneInput';

/**
 * UrlInput Component - Input URL với protocol prefix
 */
export const UrlInput = forwardRef(({
    label,
    protocol = 'https://',
    error,
    className = '',
    required = false,
    ...props
}, ref) => {
    return (
        <InputGroup
            ref={ref}
            label={label}
            type="text"
            placeholder="www.example.com"
            error={error}
            className={className}
            required={required}
            prefix={<span className="protocol-text">{protocol}</span>}
            {...props}
        />
    );
});

UrlInput.displayName = 'UrlInput';
