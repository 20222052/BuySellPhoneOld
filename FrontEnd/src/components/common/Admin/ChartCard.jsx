import { useState } from 'react';

/**
 * ChartCard Component - Card chứa biểu đồ với filter tabs
 * @param {string} title - Tiêu đề
 * @param {string} subtitle - Mô tả phụ
 * @param {string[]} filters - Mảng các filter options
 * @param {React.ReactNode} children - Chart component
 */
export default function ChartCard({
    title,
    subtitle,
    filters = ['Monthly', 'Quarterly', 'Annually'],
    children,
    className = '',
}) {
    const [activeFilter, setActiveFilter] = useState(filters[0]);

    return (
        <div className={`chart-card animate-fade-in-up ${className}`}>
            <div className="chart-card-header">
                <div>
                    <h3 className="chart-card-title">{title}</h3>
                    {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
                </div>

                {filters.length > 0 && (
                    <div className="chart-card-actions">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                className={`chart-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="chart-container">{children}</div>
        </div>
    );
}
