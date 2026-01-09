import { useState } from "react";
import { Container, Card, Table, Button, Image, Form, Row, Col, Alert } from "react-bootstrap";
import LatestProducts from "@/components/common/LatestProducts";

// Dữ liệu mẫu cho giỏ hàng
const initialCart = [
    {
        id: 1,
        name: "Samsung Galaxy S24 Plus 12GB 256GB",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        price: 15490000,
        quantity: 1,
        color: "Đen",
        memory: "256GB",
    },
    {
        id: 2,
        name: "iPhone 13 Pro Max 128GB",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        price: 18990000,
        quantity: 2,
        color: "Xanh",
        memory: "128GB",
    },
];

const latestProducts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 10,
    name: `Sản phẩm mới ${i + 1}`,
    image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
    price: "12.990.000",
}));

export default function Cart() {
    const [cart, setCart] = useState(initialCart);

    const handleQuantityChange = (id, value) => {
        setCart(cart =>
            cart.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, Number(value)) } : item
            )
        );
    };

    const handleRemove = id => {
        setCart(cart => cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm mb-4">
                <h2 className="mb-3 text-center"><i className="bi bi-cart3"></i> Giỏ hàng</h2>
                {cart.length === 0 ? (
                    <Alert variant="info" className="text-center mb-0">Giỏ hàng của bạn đang trống.</Alert>
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
                                {cart.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <Image src={item.image} alt={item.name} width={60} height={60} rounded />
                                        </td>
                                        <td style={{ minWidth: 180 }}>
                                            <div className="fw-bold">{item.name}</div>
                                        </td>
                                        <td>{item.memory} / {item.color}</td>
                                        <td className="text-danger fw-bold">{item.price.toLocaleString()}₫</td>
                                        <td style={{ maxWidth: 80 }}>
                                            <Form.Control
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={e => handleQuantityChange(item.id, e.target.value)}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="fw-bold">{(item.price * item.quantity).toLocaleString()}₫</td>
                                        <td>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Row className="justify-content-end">
                            <Col xs={12} md={6} lg={4}>
                                <Card className="p-3 border-0 shadow-sm mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold">Tổng tiền:</span>
                                        <span className="fs-5 text-danger fw-bold">{total.toLocaleString()}₫</span>
                                    </div>
                                    <Button variant="danger" className="w-100">Tiến hành đặt hàng</Button>
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
