import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import OrderService from '../../../services/orderService';
import '../../../assets/css/admin/categories.css';
import '../../../assets/css/admin/orders.css';

export default function OrderDetailModal({ show, onClose, order, onStatusUpdate }) {
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (order) {
            setStatus(order.status);
        }
    }, [order]);

    if (!show || !order) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleStatusChange = async (newStatus) => {
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
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
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
                                        <span className="info-label">ID tài khoản:</span>
                                        <span className="info-value text-muted font-monospace">{order.userId}</span>
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
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        className="order-item-img"
                                                    />
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
        </div>
    );
}
