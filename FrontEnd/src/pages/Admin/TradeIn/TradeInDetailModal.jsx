import { useState } from "react";
import { Row, Col, Card, Badge, Table } from "react-bootstrap";
import '../../../assets/css/admin/categories.css';

// ---- Hằng số tính khấu hao ----
const WEIGHTS = {
    screenCracks: 0.25, scratches: 0.15, edgeDings: 0.10,
    dents: 0.10, displayFailure: 0.20, deadPixels: 0.10, displayLines: 0.10
};
const FUNCTIONAL_PENALTIES = {
    microphoneDamage: 5, frontCameraDamage: 10, rearCameraDamage: 15,
    chargingPortDamage: 10, speakerDamage: 5, buttonDamage: 5,
    wifiBluetoothIssue: 15
};
const getCosmeticDeduction = (key, score) => (score * (WEIGHTS[key] || 0)).toFixed(1);
function getLabel(key) {
    const labels = {
        screenCracks: "Nứt vỡ màn hình", scratches: "Trầy xước màn hình/thân",
        edgeDings: "Cấn móp cạnh", dents: "Móp méo thân vỏ",
        displayFailure: "Lỗi hiển thị", deadPixels: "Điểm chết", displayLines: "Sọc màn hình",
        microphoneDamage: "Hỏng Microphone", frontCameraDamage: "Hỏng Camera trước",
        rearCameraDamage: "Hỏng Camera sau", chargingPortDamage: "Hỏng chân sạc",
        speakerDamage: "Hỏng loa", buttonDamage: "Hỏng phím cứng",
        wifiBluetoothIssue: "Lỗi Wifi/Bluetooth", battery: "Pin chai (<80%)"
    };
    return labels[key] || key;
}

// Định nghĩa luồng chuyển trạng thái hợp lệ
const STATUS_TRANSITIONS = {
    tested: [
        { to: 'processing', label: 'Đang xử lý', btnClass: 'btn-primary', icon: 'bi-telephone', requiresMessage: true, messageLabel: 'Lời nhắn tới khách hàng' },
        { to: 'cancelled', label: 'Hủy yêu cầu', btnClass: 'btn-danger', icon: 'bi-x-lg', requiresMessage: true, messageLabel: 'Lý do hủy (bắt buộc)', required: true }
    ],
    processing: [
        { to: 'completed', label: 'Hoàn thành', btnClass: 'btn-success', icon: 'bi-bag-check', requiresMessage: false, messageLabel: 'Ghi chú hoàn thành (tùy chọn)' },
        { to: 'cancelled', label: 'Hủy yêu cầu', btnClass: 'btn-danger', icon: 'bi-x-lg', requiresMessage: true, messageLabel: 'Lý do hủy (bắt buộc)', required: true }
    ]
};

const STATUS_LABELS = {
    pending: 'Chờ xử lý', tested: 'Đã kiểm tra',
    processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy'
};
const STATUS_BADGE_COLORS = {
    pending: 'warning text-dark', tested: 'success',
    processing: 'primary', completed: 'dark', cancelled: 'danger'
};

export default function TradeInDetailModal({ diagnostic, onClose, onStatusChange }) {
    const [pendingTransition, setPendingTransition] = useState(null); // { to, label, requiresMessage, messageLabel, required }
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!diagnostic) return null;

    const selectedTradeIn = diagnostic;
    const transitions = STATUS_TRANSITIONS[selectedTradeIn.status] || [];

    const handleTransitionClick = (transition) => {
        setPendingTransition(transition);
        setMessage('');
    };

    const handleConfirm = async () => {
        if (!pendingTransition) return;
        if (pendingTransition.required && !message.trim()) {
            alert('Vui lòng nhập lý do!');
            return;
        }
        setSubmitting(true);
        try {
            await onStatusChange(pendingTransition.to, message.trim());
            setPendingTransition(null);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelTransition = () => {
        setPendingTransition(null);
        setMessage('');
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div
                className="modal-container modal-lg"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 1100, width: '96%', maxHeight: '92vh', overflowY: 'auto' }}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <i className="bi bi-clipboard-check me-2"></i>
                        Kết quả thẩm định của máy cũ
                        <span className={`badge bg-${STATUS_BADGE_COLORS[selectedTradeIn.status] || 'secondary'} ms-3 fs-6 fw-normal`}>
                            {STATUS_LABELS[selectedTradeIn.status] || selectedTradeIn.status}
                        </span>
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Dialog nhập lời nhắn khi chuyển trạng thái */}
                {pendingTransition && (
                    <div style={{ background: '#fffbe6', borderBottom: '2px solid #f59e0b', padding: '16px 24px' }}>
                        <h6 className="mb-2 fw-bold" style={{ color: '#92400e' }}>
                            <i className="bi bi-chat-dots me-2"></i>
                            Chuyển sang: <strong>{STATUS_LABELS[pendingTransition.to]}</strong>
                        </h6>
                        <p className="mb-2 small text-muted">{pendingTransition.messageLabel}</p>
                        <textarea
                            className="form-control mb-3"
                            rows={3}
                            placeholder={pendingTransition.required ? 'Bắt buộc nhập...' : 'Tuỳ chọn...'}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                        <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelTransition}>
                                <i className="bi bi-arrow-left me-1"></i>Quay lại
                            </button>
                            <button
                                className={`btn ${pendingTransition.btnClass} btn-sm`}
                                onClick={handleConfirm}
                                disabled={submitting || (pendingTransition.required && !message.trim())}
                            >
                                {submitting
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span>Đang xử lý...</>
                                    : <><i className={`bi ${pendingTransition.icon} me-1`}></i>Xác nhận</>
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="modal-body bg-light" style={{ padding: '1.5rem' }}>
                    <Row className="gy-4">
                        {/* Cột trái: Thông tin thiết bị + thông tin liên hệ */}
                        <Col lg={4}>
                            {/* Thông tin liên hệ khách hàng */}
                            {(selectedTradeIn.customerName || selectedTradeIn.customerEmail || selectedTradeIn.customerPhone) && (
                                <Card className="shadow-sm mb-3 border-0" style={{ background: 'linear-gradient(135deg,#e0f2fe,#f0fdf4)' }}>
                                    <Card.Header className="bg-transparent border-bottom-0 pb-0">
                                        <h6 className="mb-0 text-primary fw-bold">
                                            <i className="bi bi-person-fill me-2"></i>Thông tin khách hàng
                                        </h6>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        {selectedTradeIn.customerName && (
                                            <p className="mb-1 small">
                                                <i className="bi bi-person me-1 text-muted"></i>
                                                <strong>Họ tên:</strong> {selectedTradeIn.customerName}
                                            </p>
                                        )}
                                        {selectedTradeIn.customerEmail && (
                                            <p className="mb-1 small">
                                                <i className="bi bi-envelope me-1 text-muted"></i>
                                                <strong>Email:</strong>{' '}
                                                <a href={`mailto:${selectedTradeIn.customerEmail}`} className="text-decoration-none">
                                                    {selectedTradeIn.customerEmail}
                                                </a>
                                            </p>
                                        )}
                                        {selectedTradeIn.customerPhone && (
                                            <p className="mb-0 small">
                                                <i className="bi bi-telephone me-1 text-muted"></i>
                                                <strong>SĐT:</strong>{' '}
                                                <a href={`tel:${selectedTradeIn.customerPhone}`} className="text-decoration-none">
                                                    {selectedTradeIn.customerPhone}
                                                </a>
                                            </p>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Thông tin thiết bị */}
                            <Card className="shadow-sm h-auto">
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0 text-start">Thông tin thiết bị</h5>
                                </Card.Header>
                                <Card.Body>
                                    <p className="text-start mb-1">
                                        <strong>Thiết bị:</strong> #{selectedTradeIn.productItemId ? selectedTradeIn.productItemId.substring(0, 8) : 'N/A'}
                                    </p>
                                    <p className="text-start mb-2">
                                        <strong>Ngày kiểm tra:</strong> {new Date(selectedTradeIn.testDate).toLocaleDateString('vi-VN')}
                                    </p>
                                    {selectedTradeIn.additionalNotes && (
                                        <p className="text-start text-muted small mt-2">Ghi chú: {selectedTradeIn.additionalNotes}</p>
                                    )}
                                    <hr />
                                    <div className="text-center">
                                        <h6 className="text-start">Đánh giá tổng quan</h6>
                                        <h3 className="text-primary fw-bold mb-0">{selectedTradeIn.overallAssessment}</h3>
                                    </div>
                                    <hr />
                                    <div className="text-center">
                                        <h6 className="text-start">Tổng Khấu Hao</h6>
                                        <h1 className="text-danger fw-bold m-0">-{selectedTradeIn.totalDepreciation}%</h1>
                                        <p className="small text-start mb-0">
                                            Giá trị còn lại thực: <strong>{(100 - selectedTradeIn.totalDepreciation).toFixed(2)}%</strong>.
                                        </p>
                                    </div>
                                    <hr />
                                    {selectedTradeIn.isContactStore || selectedTradeIn.totalDepreciation >= 75 ? (
                                        <div className="alert alert-danger mt-3 text-start mb-0">
                                            <strong>Thiết bị quá hạn mức hoặc cần chuyên gia kiểm tra lại.</strong><br />
                                            Vui lòng <strong>Liên hệ cửa hàng</strong> để được tư vấn giá thu cụ thể.
                                        </div>
                                    ) : (
                                        <div className="text-center mt-3 p-3 bg-white rounded border border-success">
                                            <h6 className="text-success fw-bold mb-2">Khoảng giá dự kiến thu lại</h6>
                                            {selectedTradeIn.minPredictedPrice && selectedTradeIn.maxPredictedPrice ? (
                                                <h5 className="text-success fw-bold m-0 text-nowrap mt-2">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTradeIn.minPredictedPrice)}
                                                    <br />-<br />
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTradeIn.maxPredictedPrice)}
                                                </h5>
                                            ) : (
                                                <h5 className="text-muted m-0">Đang cập nhật...</h5>
                                            )}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Cột phải: Chi tiết khấu hao */}
                        <Col lg={8}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h5 className="mb-0 text-start">Chi tiết các hạng mục khấu hao</h5>
                                    {selectedTradeIn.images && selectedTradeIn.images.length > 0 && (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            {selectedTradeIn.images.map((img, idx) => (
                                                <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                                                    <img src={img} alt={`img-${idx}`}
                                                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </Card.Header>
                                <Card.Body className="p-0" style={{ maxHeight: "550px", overflowY: "auto" }}>
                                    <Table striped hover responsive className="mb-0">
                                        <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
                                            <tr>
                                                <th>Hạng mục</th>
                                                <th>Tình trạng / Mức độ</th>
                                                <th className="text-end">Khấu hao ước tính (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(WEIGHTS).map(key => {
                                                const score = selectedTradeIn[key] || 0;
                                                if (score > 0) {
                                                    const deduction = getCosmeticDeduction(key, score);
                                                    return (
                                                        <tr key={key}>
                                                            <td className="align-middle">{getLabel(key)}</td>
                                                            <td className="align-middle">
                                                                <Badge bg={score > 50 ? 'danger' : 'warning'}>
                                                                    {score > 50 ? 'Nặng' : 'Nhẹ'} (Score: {score})
                                                                </Badge>
                                                            </td>
                                                            <td className="text-end text-danger fw-bold align-middle">-{deduction}%</td>
                                                        </tr>
                                                    );
                                                }
                                                return null;
                                            })}
                                            {Object.keys(FUNCTIONAL_PENALTIES).map((key, idx) => {
                                                if (selectedTradeIn[key]) {
                                                    return (
                                                        <tr key={`func-${idx}`}>
                                                            <td className="align-middle">{getLabel(key)}</td>
                                                            <td className="align-middle"><Badge bg="danger">Hỏng / Lỗi</Badge></td>
                                                            <td className="text-end text-danger fw-bold align-middle">-{FUNCTIONAL_PENALTIES[key]}%</td>
                                                        </tr>
                                                    );
                                                }
                                                return null;
                                            })}
                                            {selectedTradeIn.batteryHealth < 80 && (
                                                <tr>
                                                    <td className="align-middle">{getLabel('battery')}</td>
                                                    <td className="align-middle">Pin: {selectedTradeIn.batteryHealth}%</td>
                                                    <td className="text-end text-danger fw-bold align-middle">-{(80 - selectedTradeIn.batteryHealth) * 0.5}%</td>
                                                </tr>
                                            )}
                                            {selectedTradeIn.totalDepreciation === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-success py-4">
                                                        <i className="bi bi-check-circle-fill me-2 fs-4 align-middle"></i>
                                                        <span className="align-middle fw-semibold">Thiết bị hoạt động hoàn hảo, không có lỗi lầm!</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="fw-bold bg-white sticky-bottom shadow-sm">
                                            <tr>
                                                <td colSpan="2" className="text-start">TỔNG CỘNG</td>
                                                <td className="text-end text-danger fs-5">-{selectedTradeIn.totalDepreciation}%</td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Footer — Action buttons theo luồng trạng thái */}
                <div className="modal-footer bg-white">
                    {/* Hiện nút chuyển trạng thái nếu chưa mở dialog */}
                    {!pendingTransition && transitions.length > 0 && transitions.map(transition => (
                        <button
                            key={transition.to}
                            className={`btn ${transition.btnClass}`}
                            onClick={() => handleTransitionClick(transition)}
                        >
                            <i className={`bi ${transition.icon} me-2`}></i>
                            {transition.label}
                        </button>
                    ))}

                    {/* Thông báo trạng thái cuối */}
                    {!pendingTransition && transitions.length === 0 && (
                        <span className="text-muted fst-italic me-auto small">
                            <i className={`bi bi-${selectedTradeIn.status === 'completed' ? 'check-circle-fill text-success' : 'x-circle-fill text-danger'} me-1`}></i>
                            {selectedTradeIn.status === 'completed'
                                ? 'Yêu cầu đã hoàn thành.'
                                : 'Yêu cầu đã bị hủy, không thể thay đổi trạng thái.'}
                        </span>
                    )}

                    <button className="btn btn-secondary" onClick={onClose}>
                        <i className="bi bi-x-circle me-2"></i>Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
