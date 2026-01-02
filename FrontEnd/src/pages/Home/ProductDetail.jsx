
import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Tab, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import LatestProducts from "@/components/common/LatestProducts";

// Dữ liệu mẫu
const product = {
    id: 1,
    name: "Samsung Galaxy S24 Plus 12GB 256GB",
    image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
    description: "Samsung Galaxy S24 Plus là mẫu điện thoại cao cấp với hiệu năng mạnh mẽ, camera xuất sắc và thiết kế sang trọng.",
    specs: {
        screen: "Dynamic AMOLED 2X 6.7 inch",
        cpu: "Snapdragon 8 Gen 3",
        camera: "50MP + 12MP + 10MP",
        battery: "4900 mAh",
        os: "Android 14",
        sim: "2 Nano SIM, 5G",
        weight: "196g",
        charging: "45W",
    },
    memories: ["128GB", "256GB", "512GB"],
    colors: ["Đen", "Xanh", "Vàng", "Tím"],
    price: "15.490.000",
    oldPrice: "18.990.000",
    salePrice: "14.490.000",
    rating: 5.0,
    reviews: [
        { user: "Cô Công Thành", comment: "Máy đẹp, pin trâu, camera nét!", rating: 5 },
        { user: "Cô Công Định", comment: "Dùng rất mượt, hài lòng!", rating: 5 },
        { user: "Nguyễn Quang Huy", comment: "Thích hàng của Samsung", rating: 5 },
        { user: "Lương Tiến Giỏi", comment: "Chất lượng camera tốt, chuyên nghiệp", rating: 5 },
    ],
    questions: [
        { user: "Triệu Quỳnh Lan", question: "Máy này có chống nước không?", answer: "Có, chuẩn IP68." },
        { user: "Cô Hiếu Nguyễn", question: "Có hỗ trợ sạc nhanh không?", answer: "Có, sạc nhanh 45W." },
    ],
    promotions: [
        "Giảm thêm 1 triệu khi thanh toán qua VNPAY",
        "Tặng phiếu mua phụ kiện 500.000đ",
        "Trả góp 0% qua thẻ tín dụng",
    ],
    accessories: [
        { name: "Ốp lưng S24 Plus", price: "250.000₫", image: "https://cdn.tgdd.vn/Products/Images/60/299034/op-lung.jpg" },
        { name: "Cường lực S24 Plus", price: "150.000₫", image: "https://cdn.tgdd.vn/Products/Images/60/299035/cuong-luc.jpg" },
        { name: "Tai nghe Bluetooth", price: "990.000₫", image: "https://cdn.tgdd.vn/Products/Images/54/299036/tai-nghe.jpg" },
    ],
};

const latestProducts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 10,
    name: `Sản phẩm mới ${i + 1}`,
    image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
    price: "12.990.000",
}));


export default function ProductDetail() {
    const { id } = useParams();
    const [selectedMemory, setSelectedMemory] = useState(product.memories[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [tab, setTab] = useState("desc");

    return (
        <Container className="py-3">
            {/* Header + chọn phiên bản */}
            <Card className="mb-3 p-3 shadow-sm border-0">
                <Row>
                    <Col md={5} className="d-flex flex-column align-items-center justify-content-center">
                        <img src={product.image} alt={product.name} style={{ maxWidth: 320, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                        <div className="mt-2">
                            <Button variant="danger" size="sm"><i className="bi bi-play-circle"></i> Xem video</Button>
                        </div>
                    </Col>
                    <Col md={7}>
                        <h2 className="fw-bold mb-2" style={{ textAlign: "left" }}>{product.name}</h2>
                        <div className="mb-2" style={{ textAlign: "left" }}>
                            <Badge bg="warning" text="dark" className="me-2">{product.rating} ★</Badge>
                            <span className="text-muted">({product.reviews.length} đánh giá)</span>
                        </div>
                        <div className="mb-2" style={{ textAlign: "left" }}>
                            <span className="fs-4 fw-bold text-danger me-3">{product.price}₫</span>
                            <span className="text-decoration-line-through text-secondary">{product.oldPrice}₫</span>
                            <span className="ms-3 text-success fw-bold">{product.salePrice}₫</span>
                        </div>
                        <div className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label className="me-2">Phiên bản:</Form.Label>
                            {product.memories.map(mem => (
                                <Button key={mem} variant={selectedMemory === mem ? "primary" : "outline-primary"} className="me-2 mb-2" onClick={() => setSelectedMemory(mem)}>{mem}</Button>
                            ))}
                        </div>
                        <div className="mb-3" style={{ textAlign: "left" }}>
                            <Form.Label className="me-2">Màu sắc:</Form.Label>
                            {product.colors.map(color => (
                                <Button key={color} variant={selectedColor === color ? "dark" : "outline-dark"} className="me-2 mb-2" onClick={() => setSelectedColor(color)}>{color}</Button>
                            ))}
                        </div>
                        <div className="mb-3" style={{ textAlign: "left" }}>
                            <Button variant="danger" size="lg">Mua ngay</Button>
                            <Button variant="outline-danger" size="lg" className="ms-2">Thêm vào giỏ</Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Khuyến mãi + thông số + phụ kiện */}
            <Row className="mb-3">
                <Col md={7}>
                    <Card className="mb-3 p-3 border-0 shadow-sm">
                        <h5 className="fw-bold mb-2" style={{ textAlign: "left" }}>Thông số kỹ thuật</h5>
                        <ListGroup variant="flush" style={{ textAlign: "left" }}>
                            <ListGroup.Item><strong>Màn hình:</strong> {product.specs.screen}</ListGroup.Item>
                            <ListGroup.Item><strong>CPU:</strong> {product.specs.cpu}</ListGroup.Item>
                            <ListGroup.Item><strong>Camera:</strong> {product.specs.camera}</ListGroup.Item>
                            <ListGroup.Item><strong>Pin:</strong> {product.specs.battery}</ListGroup.Item>
                            <ListGroup.Item><strong>HĐH:</strong> {product.specs.os}</ListGroup.Item>
                            <ListGroup.Item><strong>SIM:</strong> {product.specs.sim}</ListGroup.Item>
                            <ListGroup.Item><strong>Trọng lượng:</strong> {product.specs.weight}</ListGroup.Item>
                            <ListGroup.Item><strong>Sạc nhanh:</strong> {product.specs.charging}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card className="mb-3 p-3 border-0 shadow-sm">
                        <h5 className="fw-bold mb-2" style={{ textAlign: "left" }}>Khuyến mãi nổi bật</h5>
                        <ul className="mb-0" style={{ textAlign: "left" }}>
                            {product.promotions.map((promo, idx) => (
                                <li key={idx} style={{ color: "#d32f2f" }}>{promo}</li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="mb-3 p-3 border-0 shadow-sm">
                        <h5 className="fw-bold mb-2" style={{ textAlign: "left" }}>Phụ kiện mua cùng</h5>
                        <Row>
                            {product.accessories.map((acc, idx) => (
                                <Col xs={12} sm={6} md={12} key={idx} className="mb-2">
                                    <Card className="h-100 flex-row align-items-center p-2" style={{ minHeight: 80, border: "1px solid #eee", borderRadius: 8 }}>
                                        <Form.Check type="checkbox" className="me-2" style={{ minWidth: 24 }} />
                                        <img src={acc.image} alt={acc.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, marginRight: 12, border: "1px solid #eee" }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="fw-bold" style={{ fontSize: "1rem" }}>{acc.name}</div>
                                            <div className="text-danger fw-bold">{acc.price}</div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Tabs mô tả, đánh giá, hỏi đáp */}
            <Card className="mb-3 p-3 border-0 shadow-sm">
                <Tab.Container activeKey={tab} onSelect={setTab}>
                    <Nav variant="tabs" className="mb-3" style={{ textAlign: "left" }}>
                        <Nav.Item><Nav.Link eventKey="desc">Đặc điểm nổi bật</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="review">Đánh giá</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="qa">Hỏi & đáp</Nav.Link></Nav.Item>
                    </Nav>
                    <Tab.Content style={{ textAlign: "left" }}>
                        <Tab.Pane eventKey="desc">
                            <h5 className="fw-bold mb-2">Đặc điểm nổi bật của {product.name}</h5>
                            <p>{product.description}</p>
                            <ul>
                                <li>Thiết kế sang trọng, màn hình lớn</li>
                                <li>Camera chất lượng cao, nhiều tính năng AI</li>
                                <li>Pin dung lượng lớn, sạc nhanh</li>
                                <li>Hiệu năng mạnh mẽ, đa nhiệm tốt</li>
                                <li>Hỗ trợ 5G, kết nối nhanh</li>
                            </ul>
                        </Tab.Pane>
                        <Tab.Pane eventKey="review">
                            <h5 className="fw-bold mb-2">Đánh giá sản phẩm</h5>
                            {product.reviews.length === 0 ? (
                                <p>Chưa có đánh giá nào.</p>
                            ) : (
                                product.reviews.map((r, idx) => (
                                    <div key={idx} className="mb-2">
                                        <strong>{r.user}</strong> <Badge bg="info">{r.rating}★</Badge>
                                        <div>{r.comment}</div>
                                    </div>
                                ))
                            )}
                        </Tab.Pane>
                        <Tab.Pane eventKey="qa">
                            <h5 className="fw-bold mb-2">Hỏi & đáp</h5>
                            {product.questions.length === 0 ? (
                                <p>Chưa có câu hỏi nào.</p>
                            ) : (
                                product.questions.map((q, idx) => (
                                    <div key={idx} className="mb-2">
                                        <strong>{q.user}</strong>: {q.question}
                                        <div className="ms-3 text-danger">Quản trị viên: {q.answer}</div>
                                    </div>
                                ))
                            )}
                            <Button variant="outline-primary" size="sm" className="mt-2">Gửi câu hỏi</Button>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Card>

            {/* Sản phẩm mới nhất */}
            <LatestProducts products={latestProducts} />
        </Container>
    );
}
