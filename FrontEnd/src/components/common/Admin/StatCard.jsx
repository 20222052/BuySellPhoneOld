/**
 * StatCard Component - Hiển thị thống kê với animation
 * @param {string} title - Tiêu đề
 * @param {string|number} value - Giá trị
 * @param {string} change - Phần trăm thay đổi (ví dụ: "+11.01%")
 * @param {boolean} isPositive - Thay đổi tích cực hay tiêu cực
 * @param {string} icon - Bootstrap icon class
 * @param {string} variant - primary | success | warning | danger | info | secondary
 */
export default function StatCard({
    title,
    value,
    change,
    isPositive = true,
    icon = 'bi-graph-up',
    variant = 'primary',
    children,
}) {
    return (
        <div className={`stat-card ${variant} animate-fade-in-up`}>
            <div className="stat-card-header">
                <div className="stat-card-icon">
                    <i className={`bi ${icon}`}></i>
                </div>
                <p className="stat-card-title">{title}</p>
                <div className="stat-card-value">
                    <span>{value}</span>
                </div>
            </div>
            

            {children && <div className="stat-card-chart">{children}</div>}
        </div>
    );
}
