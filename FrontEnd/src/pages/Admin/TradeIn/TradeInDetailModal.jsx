import '../../../assets/css/admin/categories.css';

export default function TradeInDetailModal({ diagnostic, onClose, onStatusChange }) {
    if (!diagnostic) return null;

    const formatPercent = (value) => {
        if (value === null || value === undefined) return '-';
        return `${parseFloat(value).toFixed(1)}%`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getCheckStatus = (value) => {
        if (value === true) return { icon: 'bi-x-circle-fill', class: 'text-danger', label: 'Lỗi' };
        if (value === false) return { icon: 'bi-check-circle-fill', class: 'text-success', label: 'Tốt' };
        return { icon: 'bi-dash-circle', class: 'text-muted', label: 'N/A' };
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Chờ xử lý',
            tested: 'Đã kiểm tra',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    const functionalChecks = [
        { label: 'Micro', value: diagnostic.microphoneDamage, icon: 'bi-mic' },
        { label: 'Camera trước', value: diagnostic.frontCameraDamage, icon: 'bi-camera' },
        { label: 'Camera sau', value: diagnostic.rearCameraDamage, icon: 'bi-camera-fill' },
        { label: 'Cổng sạc', value: diagnostic.chargingPortDamage, icon: 'bi-plug' },
        { label: 'Loa', value: diagnostic.speakerDamage, icon: 'bi-speaker' },
        { label: 'Nút bấm', value: diagnostic.buttonDamage, icon: 'bi-toggles' },
        { label: 'Wifi/Bluetooth', value: diagnostic.wifiBluetoothIssue, icon: 'bi-wifi' },
    ];

    const screenChecks = [
        { label: 'Nứt màn hình', value: diagnostic.screenCracks },
        { label: 'Trầy xước', value: diagnostic.scratches },
        { label: 'Móp cạnh', value: diagnostic.edgeDings },
        { label: 'Lõm', value: diagnostic.dents },
        { label: 'Lỗi hiển thị', value: diagnostic.displayFailure },
        { label: 'Điểm chết', value: diagnostic.deadPixels },
        { label: 'Sọc màn', value: diagnostic.displayLines },
    ];

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal-container modal-lg" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <i className="bi bi-clipboard-check me-2"></i>
                        Chi tiết yêu cầu Trade-In
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="stat-card stat-card-primary">
                                <div className="stat-icon">
                                    <i className="bi bi-hash"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Mã yêu cầu</span>
                                    <span className="stat-value">{diagnostic.id?.substring(0, 8)}...</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card stat-card-info">
                                <div className="stat-icon">
                                    <i className="bi bi-calendar3"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Ngày kiểm tra</span>
                                    <span className="stat-value">{formatDate(diagnostic.testDate)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card stat-card-warning">
                                <div className="stat-icon">
                                    <i className="bi bi-percent"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Độ hao mòn</span>
                                    <span className="stat-value">{formatPercent(diagnostic.totalDepreciation)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="stat-card stat-card-success">
                                <div className="stat-icon">
                                    <i className="bi bi-flag"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-label">Trạng thái</span>
                                    <span className={`status-badge status-${diagnostic.status?.toLowerCase()}`}>
                                        {getStatusLabel(diagnostic.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Battery Health */}
                    <div className="form-section mb-4">
                        <h4 className="form-section-title">
                            <i className="bi bi-battery-charging me-2"></i>
                            Tình trạng pin
                        </h4>
                        <div className="battery-container">
                            <div className="battery-bar-bg">
                                <div
                                    className="battery-bar-fill"
                                    style={{
                                        width: `${diagnostic.batteryHealth || 0}%`,
                                        background: parseFloat(diagnostic.batteryHealth) > 80
                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                            : parseFloat(diagnostic.batteryHealth) > 50
                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                : 'linear-gradient(90deg, #ef4444, #f87171)'
                                    }}
                                ></div>
                            </div>
                            <span className="battery-value">{formatPercent(diagnostic.batteryHealth)}</span>
                        </div>
                    </div>

                    {/* Functional Checks */}
                    <div className="form-section mb-4">
                        <h4 className="form-section-title">
                            <i className="bi bi-gear me-2"></i>
                            Kiểm tra chức năng
                        </h4>
                        <div className="row">
                            {functionalChecks.map((check, idx) => {
                                const status = getCheckStatus(check.value);
                                return (
                                    <div key={idx} className="col-md-4 col-lg-3 mb-3">
                                        <div className={`functional-check-card ${check.value === true ? 'damaged' : check.value === false ? 'ok' : ''}`}>
                                            <i className={`bi ${check.icon} check-icon`}></i>
                                            <span className="check-label">{check.label}</span>
                                            <div className={`check-status ${status.class}`}>
                                                <i className={`bi ${status.icon}`}></i>
                                                <span>{status.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Screen Checks */}
                    <div className="form-section mb-4">
                        <h4 className="form-section-title">
                            <i className="bi bi-phone me-2"></i>
                            Tình trạng màn hình & vỏ
                        </h4>
                        <div className="screen-checks-grid">
                            {screenChecks.map((check, idx) => (
                                <div key={idx} className="screen-check-item">
                                    <div className="screen-check-header">
                                        <span className="check-name">{check.label}</span>
                                        <span className={`check-value ${parseFloat(check.value) > 20 ? 'text-danger' : parseFloat(check.value) > 10 ? 'text-warning' : 'text-success'}`}>
                                            {formatPercent(check.value)}
                                        </span>
                                    </div>
                                    <div className="screen-check-bar">
                                        <div
                                            className="screen-check-fill"
                                            style={{
                                                width: `${Math.min(parseFloat(check.value) || 0, 100)}%`,
                                                background: parseFloat(check.value) > 20
                                                    ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                                    : parseFloat(check.value) > 10
                                                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                        : 'linear-gradient(90deg, #10b981, #34d399)'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overall Assessment */}
                    <div className="form-section">
                        <h4 className="form-section-title">
                            <i className="bi bi-card-text me-2"></i>
                            Đánh giá tổng thể
                        </h4>
                        <div className="assessment-box">
                            {diagnostic.overallAssessment || 'Chưa có đánh giá'}
                        </div>
                    </div>

                    {/* Notes */}
                    {diagnostic.additionalNotes && (
                        <div className="form-section mt-4">
                            <h4 className="form-section-title">
                                <i className="bi bi-journal-text me-2"></i>
                                Ghi chú
                            </h4>
                            <div className="notes-box">
                                {diagnostic.additionalNotes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    {diagnostic.status === 'pending' && (
                        <>
                            <button
                                className="btn btn-success"
                                onClick={() => onStatusChange('tested')}
                            >
                                <i className="bi bi-check-lg me-2"></i>
                                Đánh dấu đã kiểm tra
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => onStatusChange('cancelled')}
                            >
                                <i className="bi bi-x-lg me-2"></i>
                                Hủy yêu cầu
                            </button>
                        </>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        <i className="bi bi-x-circle me-2"></i>
                        Đóng
                    </button>
                </div>
            </div>

            <style>{`
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--card-bg);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }
                .stat-card .stat-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    font-size: 1.25rem;
                }
                .stat-card-primary .stat-icon { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
                .stat-card-info .stat-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .stat-card-warning .stat-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .stat-card-success .stat-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .stat-content { display: flex; flex-direction: column; }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); }
                .stat-value { font-size: 1rem; font-weight: 600; color: var(--text-primary); }

                .battery-container { display: flex; align-items: center; gap: 16px; }
                .battery-bar-bg {
                    flex: 1;
                    height: 24px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .battery-bar-fill {
                    height: 100%;
                    border-radius: 12px;
                    transition: width 0.3s ease;
                }
                .battery-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); min-width: 60px; }

                .functional-check-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }
                .functional-check-card.ok { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
                .functional-check-card.damaged { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
                .check-icon { font-size: 1.5rem; color: var(--text-muted); }
                .check-label { font-size: 0.85rem; color: var(--text-secondary); }
                .check-status { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; font-weight: 600; }

                .screen-checks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
                .screen-check-item { background: var(--bg-tertiary); padding: 12px 16px; border-radius: 8px; }
                .screen-check-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .check-name { font-size: 0.85rem; color: var(--text-secondary); }
                .check-value { font-weight: 600; font-size: 0.85rem; }
                .screen-check-bar { height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
                .screen-check-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }

                .assessment-box, .notes-box {
                    background: var(--bg-tertiary);
                    padding: 16px;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }
            `}</style>
        </div>
    );
}
