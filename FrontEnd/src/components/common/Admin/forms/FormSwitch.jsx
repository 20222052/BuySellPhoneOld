import { forwardRef } from 'react';

/**
 * FormSwitch Component - Toggle switch
 * @param {string} label - Nhãn
 * @param {string} size - sm | md | lg
 * @param {string} variant - primary | success | warning | danger
 */
const FormSwitch = forwardRef(({
    label,
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    variant = 'primary',
    labelPosition = 'right',
    className = '',
    ...props
}, ref) => {
    return (
        <label className={`admin-switch ${size} ${variant} ${disabled ? 'disabled' : ''} ${className}`}>
            {labelPosition === 'left' && label && (
                <span className="switch-label">{label}</span>
            )}
            <div className="switch-wrapper">
                <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                />
                <span className="switch-slider"></span>
            </div>
            {labelPosition === 'right' && label && (
                <span className="switch-label">{label}</span>
            )}
        </label>
    );
});

FormSwitch.displayName = 'FormSwitch';

export default FormSwitch;
