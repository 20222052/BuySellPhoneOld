/**
 * ProgressCircle Component - Biểu đồ tròn tiến độ
 * @param {number} value - Giá trị phần trăm (0-100)
 * @param {string} label - Nhãn hiển thị
 * @param {string} color - Màu progress (CSS color)
 * @param {number} size - Kích thước (px)
 * @param {number} strokeWidth - Độ dày đường tròn
 */
export default function ProgressCircle({
    value = 0,
    label = '',
    color = '#3b82f6',
    size = 180,
    strokeWidth = 12,
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="progress-circle" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    className="progress-circle-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="progress-circle-fill"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ stroke: color }}
                />
            </svg>
            <div className="progress-circle-text">
                <span className="progress-circle-value">{value}%</span>
                {label && <span className="progress-circle-label">{label}</span>}
            </div>
        </div>
    );
}
