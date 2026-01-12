import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Image, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LatestProducts from "@/components/common/LatestProducts";
import ProductItemService from "../../services/productItemService";
import { fetchCart, updateCartItem, removeFromCart, clearCartError, clearCartSuccess } from "../../store/slices/cartSlice";

export default function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { items: cart, loading, error, success, totalPrice } = useSelector((state) => state.cart);

    const [latestProducts, setLatestProducts] = useState([]);

    // Fetch cart khi component mount hoặc khi user thay đổi
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            dispatch(fetchCart(user.id));
        }
    }, [dispatch, isAuthenticated, user?.id]);

    // Fetch latest products
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await ProductItemService.getAllForList({
                    sortBy: "createdAt",
                    sortDir: "DESC",
                    page: 0,
                    pageSize: 6
                });
                setLatestProducts(res?.data?.items || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchLatest();
    }, []);

    // Hiển thị toast khi có success hoặc error
    useEffect(() => {
        if (success) {
            toast.success(success, { onClose: () => dispatch(clearCartSuccess()), autoClose: 3000 });
        }
    }, [success, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error, { onClose: () => dispatch(clearCartError()), autoClose: 5000 });
        }
    }, [error, dispatch]);

    const handleQuantityChange = (cartItemId, value) => {
        const quantity = Math.max(0, Number(value));
        dispatch(updateCartItem({ cartItemId, quantity }));
    };

    const handleRemove = (cartItemId) => {
        dispatch(removeFromCart(cartItemId));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price || 0);
    };

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <Container className="py-4">
                <Card className="p-4 border-0 shadow-sm mb-4 text-center">
                    <h2 className="mb-3"><i className="bi bi-cart3"></i> Giỏ hàng</h2>
                    <Alert variant="warning">
                        Vui lòng <Button variant="link" className="p-0" onClick={() => navigate("/login")}>đăng nhập</Button> để xem giỏ hàng.
                    </Alert>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <Card className="p-4 border-0 shadow-sm mb-4">
                <h2 className="mb-3 text-center"><i className="bi bi-cart3"></i> Giỏ hàng</h2>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Đang tải giỏ hàng...</p>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="text-center mb-0">
                        <p>Giỏ hàng của bạn đang trống.</p>
                        <Button variant="primary" className="mt-3" onClick={() => navigate("/products")}>
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                ) : (
                    <>
                        <Table responsive hover className="align-middle mb-4">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Sản phẩm</th>
                                    <th>Phiên bản</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(item => {
                                    // Lấy ảnh từ productDetail nếu có
                                    const primaryImage = item.productDetail?.media?.find(m => m.primary)?.url
                                        || item.productDetail?.media?.[0]?.url
                                        || "https://via.placeholder.com/60";

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <Image
                                                    src={primaryImage}
                                                    alt={item.productName}
                                                    width={60}
                                                    height={60}
                                                    rounded
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </td>
                                            <td style={{ minWidth: 180 }}>
                                                <div className="fw-bold">{item.productName}</div>
                                            </td>
                                            <td>
                                                {item.productModelName && <span>{item.productModelName}</span>}
                                                {item.colorName && <span> / {item.colorName}</span>}
                                            </td>
                                            <td className="text-danger fw-bold">
                                                {formatPrice(item.unitPrice)}₫
                                            </td>
                                            <td style={{ maxWidth: 100 }}>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    value={item.quantity}
                                                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                                                    size="sm"
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="fw-bold">
                                                {formatPrice(item.totalPrice)}₫
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={loading}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                        <Row className="justify-content-end">
                            <Col xs={12} md={6} lg={4}>
                                <Card className="p-3 border-0 shadow-sm mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold">Tổng tiền:</span>
                                        <span className="fs-5 text-danger fw-bold">
                                            {formatPrice(totalPrice)}₫
                                        </span>
                                    </div>
                                    <Button
                                        variant="danger"
                                        className="w-100"
                                        onClick={() => navigate("/checkout")}
                                    >
                                        Tiến hành đặt hàng
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Card>
            <LatestProducts products={latestProducts} />
        </Container>
    );
}
