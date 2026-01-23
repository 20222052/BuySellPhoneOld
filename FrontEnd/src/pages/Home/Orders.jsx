import { useState, useEffect } from "react";
import { Container, Card, Table, Badge, Spinner, Alert, Button, Collapse, Image, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CheckoutService from "../../services/checkoutService";

const statusMap = {
    pending: { label: "Chờ xác nhận", variant: "warning" },
    paid: { label: "Đã thanh toán", variant: "info" },
    processing: { label: "Đang xử lý", variant: "primary" },
    shipped: { label: "Đang giao", variant: "info" },
    completed: { label: "Đã giao", variant: "success" },
    cancelled: { label: "Đã hủy", variant: "danger" },
    refunded: { label: "Đã hoàn tiền", variant: "secondary" }
};

const paymentMethodMap = {
    cod: "Thanh toán khi nhận hàng",
    bank_transfer: "Chuyển khoản ngân hàng"
};

export default function Orders() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchOrders();
    }, [isAuthenticated, user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await CheckoutService.getOrdersByUserId(user.id);
            setOrders(res.data || []);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price || 0);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm">
                <h2 className="mb-4 text-center">
                    <i className="bi bi-receipt"></i> Đơn hàng của bạn
                </h2>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Đang tải đơn hàng...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : orders.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Bạn chưa có đơn hàng nào.
                        <br />
                        <Button variant="primary" className="mt-3" onClick={() => navigate("/products")}>
                            Mua sắm ngay
                        </Button>
                    </Alert>
                ) : (
                    <Table responsive hover className="align-middle">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Mã đơn</th>
                                <th>Ngày đặt</th>
                                <th>Trạng thái</th>
                                <th>Thanh toán</th>
                                <th>Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <>
                                    <tr key={order.orderId}
                                        onClick={() => toggleExpand(order.orderId)}
                                        style={{ cursor: "pointer" }}>
                                        <td>
                                            <i className={`bi bi-chevron-${expandedOrder === order.orderId ? 'up' : 'down'}`}></i>
                                        </td>
                                        <td className="fw-bold">{order.orderCode}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <Badge bg={statusMap[order.status]?.variant || "secondary"}>
                                                {statusMap[order.status]?.label || order.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <small>{paymentMethodMap[order.paymentMethod] || order.paymentMethod}</small>
                                        </td>
                                        <td className="text-danger fw-bold">{formatPrice(order.total)}₫</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} className="p-0">
                                            <Collapse in={expandedOrder === order.orderId}>
                                                <div className="p-3 bg-light">
                                                    <Row>
                                                        <Col md={8}>
                                                            <h6 className="mb-3">Chi tiết sản phẩm</h6>
                                                            {order.items?.map(item => (
                                                                <Card key={item.id} className="mb-2 p-2 d-flex flex-row align-items-center">
                                                                    <Image
                                                                        src={item.imageUrl || "https://via.placeholder.com/50"}
                                                                        width={50} height={50} rounded
                                                                        style={{ objectFit: "cover" }}
                                                                        className="me-3"
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-bold">{item.productName}</div>
                                                                        <small className="text-muted">
                                                                            {item.modelName} / {item.colorName}
                                                                        </small>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <div>{formatPrice(item.unitPrice)}₫ x {item.quantity}</div>
                                                                        <div className="fw-bold text-danger">
                                                                            {formatPrice(item.totalPrice)}₫
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </Col>
                                                        <Col md={4}>
                                                            <h6 className="mb-3">Thông tin giao hàng</h6>
                                                            {order.shippingAddress && (
                                                                <Card className="p-2">
                                                                    <div className="fw-bold">{order.shippingAddress.fullName}</div>
                                                                    <div>{order.shippingAddress.phone}</div>
                                                                    <div className="small text-muted">
                                                                        {order.shippingAddress.fullAddress}
                                                                    </div>
                                                                </Card>
                                                            )}
                                                            <div className="mt-3">
                                                                <div className="d-flex justify-content-between">
                                                                    <span>Tạm tính:</span>
                                                                    <span>{formatPrice(order.subtotal)}₫</span>
                                                                </div>
                                                                <div className="d-flex justify-content-between">
                                                                    <span>Phí vận chuyển:</span>
                                                                    <span>{formatPrice(order.shippingFee)}₫</span>
                                                                </div>
                                                                <hr />
                                                                <div className="d-flex justify-content-between fw-bold">
                                                                    <span>Tổng cộng:</span>
                                                                    <span className="text-danger">{formatPrice(order.total)}₫</span>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Collapse>
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </Container>
    );
}
