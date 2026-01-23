/**
 * DataTable Component - Bảng dữ liệu với pagination
 * @param {string} title - Tiêu đề bảng
 * @param {Array} columns - Cấu hình cột [{key, label, render?}]
 * @param {Array} data - Dữ liệu
 * @param {boolean} loading - Đang tải dữ liệu
 * @param {React.ReactNode} actions - Các action button
 */
export default function DataTable({
    title,
    columns = [],
    data = [],
    loading = false,
    actions,
    onRowClick,
}) {
    return (
        <div className="data-table-card animate-fade-in-up">
            <div className="data-table-header">
                <h3 className="data-table-title">{title}</h3>
                {actions && <div className="data-table-actions">{actions}</div>}
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{ ...(col.width ? { width: col.width } : {}), ...(col.key === 'title' ? { textAlign: 'left' } : {}) }}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-muted">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            style={col.key === 'title' ? { textAlign: 'left' } : {}}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Badge Component cho DataTable
 */
export function TableBadge({ children, variant = 'primary' }) {
    return <span className={`admin-badge ${variant}`}>{children}</span>;
}

/**
 * Avatar Component cho DataTable
 */
export function TableAvatar({ src, name, subtitle }) {
    return (
        <div className="d-flex align-items-center gap-3">
            <img
                src={src || `https://ui-avatars.com/api/?name=${name}`}
                alt={name}
                className="rounded-circle"
                width={40}
                height={40}
            />
            <div>
                <p className="mb-0 fw-medium">{name}</p>
                {subtitle && <small className="text-muted">{subtitle}</small>}
            </div>
        </div>
    );
}
