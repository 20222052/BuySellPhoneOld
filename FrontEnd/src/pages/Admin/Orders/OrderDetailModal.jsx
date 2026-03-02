import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import OrderService from '../../../services/orderService';
import '../../../assets/css/admin/categories.css';
import '../../../assets/css/admin/orders.css';

export default function OrderDetailModal({ show, onClose, order, onStatusUpdate }) {
    const [status, setStatus] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (order) {
            setStatus(order.status);
        }
    }, [order]);

    if (!show || !order) return null;

    const getAvailableStatuses = (currentStatus) => {
        switch (currentStatus) {
            case 'pending':
                return [
                    { value: 'pending', label: 'Pending' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'cancelled', label: 'Cancelled' }
                ];
            case 'processing':
                return [
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipping', label: 'Shipping' },
                    { value: 'cancelled', label: 'Cancelled' }
                ];
            case 'shipping':
                return [
                    { value: 'shipping', label: 'Shipping' },
                    { value: 'completed', label: 'Completed' }
                ];
            case 'completed':
                return [{ value: 'completed', label: 'Completed' }];
            case 'cancelled':
                return [{ value: 'cancelled', label: 'Cancelled' }];
            default:
                return [
                    { value: 'pending', label: 'Pending' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipping', label: 'Shipping' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                ];
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === 'cancelled') {
            setShowCancelModal(true);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang ${newStatus}?`)) {
            setStatus(order.status); // Reset if cancelled
            return;
        }

        try {
            await OrderService.updateStatus(order.id, newStatus);
            toast.success("Cập nhật trạng thái thành công");
            if (onStatusUpdate) onStatusUpdate();
            onClose(); // Close modal on success
        } catch (error) {
            toast.error(error.message || "Cập nhật thất bại");
            setStatus(order.status); // Reset on error
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            toast.warning("Vui lòng nhập lý do hủy đơn hàng");
            return;
        }

        setCancelLoading(true);
        try {
            await OrderService.cancelOrder(order.id, cancelReason);
            toast.success("Hủy đơn hàng thành công");
            if (onStatusUpdate) onStatusUpdate();
            setShowCancelModal(false);
            setCancelReason('');
            onClose(); // Close main modal
        } catch (error) {
            toast.error(error.message || "Hủy đơn hàng thất bại");
            setStatus(order.status); // Reset default select status
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">
                        <i className="bi bi-receipt"></i>
                        Chi tiết đơn hàng <span className="order-code ms-2">#{order.code}</span>
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Status & Payment Info */}
                    <div className="order-summary-box mt-0 mb-4">
                        <div className="row g-4">
                            <div className="col-md-4">
                                <span className="text-secondary small d-block mb-2">Trạng thái đơn hàng</span>
                                <div className="d-flex align-items-center gap-2">
                                    {/* <span className={`status-badge status-${status?.toLowerCase()}`}>{status}</span> */}
                                    <select
                                        className="form-select form-select-sm "
                                        style={{ width: 'auto', minWidth: '140px' }}
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={order.status === 'cancelled' || order.status === 'completed'}
                                    >
                                        {getAvailableStatuses(order.status).map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <span className="text-secondary small d-block mb-2">Phương thức thanh toán</span>
                                <span className="payment-method fs-6">{order.paymentMethod}</span>
                            </div>
                            <div className="col-md-4">
                                <span className="text-secondary small d-block mb-2">Trạng thái thanh toán</span>
                                <span className={`status-badge ${order.paymentStatus === 'PAID' ? 'status-completed' : 'status-pending'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mb-4">
                        {/* Customer Info */}
                        <div className="col-md-6">
                            <div className="customer-info-box">
                                <div className="customer-info-header">
                                    <i className="bi bi-person"></i>
                                    Thông tin khách hàng
                                </div>
                                <div className="info-content">
                                    <div className="info-row">
                                        <span className="info-label">Họ tên:</span>
                                        <span className="info-value text-primary">{order.customerName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{order.customerEmail || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">SĐT / ID:</span>
                                        <span className="info-value">{order.customerPhone || 'Chưa cập nhật'} <span className="text-muted font-monospace small">({order.userId?.substring(0, 8)}...)</span></span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Ngày đặt:</span>
                                        <span className="info-value">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="col-md-6">
                            <div className="customer-info-box">
                                <div className="customer-info-header">
                                    <i className="bi bi-truck"></i>
                                    Thông tin giao hàng
                                </div>
                                <div className="info-content">
                                    <div className="info-row">
                                        <span className="info-label">Người nhận:</span>
                                        <span className="info-value fw-bold">{order.shippingFullName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Số điện thoại:</span>
                                        <span className="info-value">{order.shippingPhone}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Địa chỉ:</span>
                                        <span className="info-value">{order.shippingAddress}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="customer-info-box p-0 overflow-hidden mb-4">
                        <div className="p-3 border-bottom bg-light">
                            <h5 className="m-0 fs-6 fw-bold text-secondary">Sản phẩm đã đặt</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="order-items-table mt-0">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '20px' }}>Sản phẩm</th>
                                        <th className="text-center">Phân loại</th>
                                        <th className="text-end">Đơn giá</th>
                                        <th className="text-center">SL</th>
                                        <th className="text-end" style={{ paddingRight: '20px' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ paddingLeft: '20px' }}>
                                                <div className="d-flex align-items-center gap-3">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            className="order-item-img"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="order-item-img"
                                                        style={{
                                                            display: item.imageUrl ? 'none' : 'flex',
                                                            background: '#f1f5f9',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#94a3b8',
                                                            fontSize: '20px',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <i className="bi bi-image"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium text-dark">{item.productName}</div>
                                                        <small className="text-muted">Mã SP: {item.productId?.substring(0, 8)}...</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center text-secondary small">
                                                <span className="badge bg-light text-dark border">{item.modelName}</span>
                                                <span className="badge bg-light text-dark border ms-1">{item.colorName}</span>
                                            </td>
                                            <td className="text-end font-monospace text-secondary">
                                                {formatPrice(item.unitPrice)}
                                            </td>
                                            <td className="text-center fw-bold">
                                                {item.quantity}
                                            </td>
                                            <td className="text-end fw-bold text-primary" style={{ paddingRight: '20px' }}>
                                                {formatPrice(item.totalPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="row justify-content-end">
                        <div className="col-md-4">
                            <div className="order-summary-box mt-0">
                                <div className="summary-row">
                                    <span className="text-secondary">Tổng tiền hàng:</span>
                                    <span className="fw-medium">{formatPrice(order.total)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="text-secondary">Phí vận chuyển:</span>
                                    <span className="fw-medium">{formatPrice(0)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Tổng cộng:</span>
                                    <span className="fs-5 text-danger">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowCancelModal(false)}>
                    <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title mb-0">Hủy đơn hàng #{order.code}</h5>
                            <button className="modal-close text-white" onClick={() => setShowCancelModal(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="form-group mb-0">
                                <label className="form-label fw-bold mb-2">Lý do hủy đơn <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Vui lòng nhập lý do hủy đơn hàng để gửi cho khách hàng..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    autoFocus
                                ></textarea>
                                <div className="form-text text-muted mt-2">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Lý do này sẽ được đính kèm vào email thông báo hủy đơn hàng gửi cho khách hàng.
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-secondary px-4"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelLoading}
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger px-4"
                                onClick={handleConfirmCancel}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...</>
                                ) : (
                                    <><i className="bi bi-x-circle me-1"></i>Xác nhận hủy</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
