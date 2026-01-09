import { forwardRef } from 'react';

/**
 * FormCheckbox Component - Checkbox/Radio với variants
 * @param {string} label - Nhãn
 * @param {string} type - checkbox | radio
 * @param {string} variant - default | primary | success | warning | danger
 */
const FormCheckbox = forwardRef(({
    label,
    type = 'checkbox',
    checked = false,
    onChange,
    disabled = false,
    variant = 'primary',
    className = '',
    name,
    value,
    ...props
}, ref) => {
    return (
        <label className={`admin-checkbox ${variant} ${disabled ? 'disabled' : ''} ${className}`}>
            <input
                ref={ref}
                type={type}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                name={name}
                value={value}
                {...props}
            />
            <span className={`checkbox-mark ${type === 'radio' ? 'radio' : ''}`}>
                {type === 'checkbox' && checked && <i className="bi bi-check"></i>}
            </span>
            {label && <span className="checkbox-label">{label}</span>}
        </label>
    );
});

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;

/**
 * CheckboxGroup Component - Nhóm checkbox/radio
 */
export function CheckboxGroup({
    label,
    options = [],
    value,
    onChange,
    type = 'checkbox',
    direction = 'horizontal',
    disabled = false,
    error,
    required = false,
}) {
    const handleChange = (optValue, checked) => {
        if (type === 'radio') {
            onChange && onChange(optValue);
        } else {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = checked
                ? [...currentValues, optValue]
                : currentValues.filter(v => v !== optValue);
            onChange && onChange(newValues);
        }
    };

    const isChecked = (optValue) => {
        if (type === 'radio') return value === optValue;
        return Array.isArray(value) && value.includes(optValue);
    };

    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className={`checkbox-group ${direction}`}>
                {options.map((opt) => (
                    <FormCheckbox
                        key={opt.value}
                        type={type}
                        label={opt.label}
                        checked={isChecked(opt.value)}
                        onChange={(e) => handleChange(opt.value, e.target.checked)}
                        disabled={disabled || opt.disabled}
                        name={type === 'radio' ? label : undefined}
                        value={opt.value}
                    />
                ))}
            </div>
            {error && <span className="form-feedback error">{error}</span>}
        </div>
    );
}
