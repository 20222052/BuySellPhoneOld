
import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Image, ProgressBar } from "react-bootstrap";

// Dữ liệu mẫu đơn hàng (lấy 1 sản phẩm như ảnh demo)
const orderItems = [
    {
        id: 1,
        name: "Samsung Galaxy S24 Plus 12GB 256GB-Xám",
        memory: "256GB",
        color: "Xám",
        price: 15490000,
        quantity: 1,
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        oldPrice: 18650000,
    },
];

const provinces = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];
const districts = ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh"];
const stores = ["CellphoneS 123 Lê Lợi", "CellphoneS 456 Nguyễn Trãi", "CellphoneS 789 CMT8"];

export default function CheckOut() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "Nguyễn Thanh Tùng",
        phone: "0976956191",
        email: "ngtung2004@gmail.com",
        receiveEmail: false,
        province: "Hồ Chí Minh",
        district: "",
        store: "",
        note: "",
        invoice: "no",
        paymentMethod: "cash", // Thêm trường này
    });
    const [submitted, setSubmitted] = useState(false);

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleContinue = e => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = e => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Container className="py-4">
                <Card className="p-4 border-0 shadow-sm text-center">
                    <h2 className="mb-3 text-success"><i className="bi bi-check-circle"></i> Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng tại PhoneZin. Đơn hàng của bạn sẽ được xử lý sớm nhất.</p>
                    <Button href="/" variant="primary">Về trang chủ</Button>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ background: "#f7f8fa", minHeight: 600 }}>
            <Row className="justify-content-center">
                <Col md={8} lg={7}>
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        {/* Tiến trình bước */}
                        <div className="d-flex align-items-center mb-4">
                            <Button variant="link" className="p-0 me-2" style={{ color: "#d70018" }} disabled={step === 1} onClick={() => setStep(1)}>
                                <i className="bi bi-arrow-left fs-5"></i>
                            </Button>
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-center">
                                    <div className={step === 1 ? "fw-bold text-danger" : "fw-bold text-secondary"} style={{ fontSize: 18 }}>1. THÔNG TIN</div>
                                    <div className="mx-3" style={{ borderBottom: "2px solid #eee", width: 40 }}></div>
                                    <div className={step === 2 ? "fw-bold text-danger" : "fw-bold text-secondary"} style={{ fontSize: 18 }}>2. THANH TOÁN</div>
                                </div>
                            </div>
                        </div>

                        {step === 1 && (
                            <Form onSubmit={handleContinue}>
                                {/* Sản phẩm */}
                                <Card className="mb-3 border-0 bg-light p-3 d-flex flex-row align-items-center">
                                    <Image src={orderItems[0].image} width={70} height={70} rounded className="me-3" />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold" style={{ textAlign: 'left' }}>{orderItems[0].name}</div>
                                        <div className="text-danger fw-bold" style={{ fontSize: 18, textAlign: 'left' }}>{orderItems[0].price.toLocaleString()}đ</div>
                                        <div className="text-muted text-decoration-line-through small" style={{ textAlign: 'left' }}>{orderItems[0].oldPrice?.toLocaleString()}đ</div>
                                    </div>
                                    <div className="ms-3" style={{ textAlign: 'right' }}>Số lượng: <span className="fw-bold">{orderItems[0].quantity}</span></div>
                                </Card>

                                {/* Thông tin khách hàng */}
                                <div className="mb-3">
                                    <div className="fw-bold mb-2" style={{ fontSize: 16, textAlign: 'left' }}>THÔNG TIN KHÁCH HÀNG</div>
                                    <Row className="g-2 align-items-center mb-2">
                                        <Col xs={7}>
                                            <Form.Control name="name" value={form.name} onChange={handleChange} required placeholder="Họ tên" style={{ textAlign: 'left' }} />
                                        </Col>
                                        <Col xs={5}>
                                            <Form.Control name="phone" value={form.phone} onChange={handleChange} required placeholder="Số điện thoại" style={{ textAlign: 'left' }} />
                                        </Col>
                                    </Row>
                                    <Row className="g-2 mb-2">
                                        <Col xs={12}>
                                            <Form.Control name="email" value={form.email} onChange={handleChange} required placeholder="Email" type="email" style={{ textAlign: 'left' }} />
                                        </Col>
                                    </Row>

                                </div>

                                {/* Thông tin nhận hàng */}
                                <div className="mb-3">

                                    <Row className="g-2 mb-2">
                                        <Col md={4} xs={12}>
                                            <Form.Select name="province" value={form.province} onChange={handleChange} required style={{ textAlign: 'left' }}>
                                                {provinces.map(p => <option key={p}>{p}</option>)}
                                            </Form.Select>
                                        </Col>
                                        <Col md={4} xs={12}>
                                            <Form.Select name="district" value={form.district} onChange={handleChange} required style={{ textAlign: 'left' }}>
                                                <option value="">Chọn quận/huyện</option>
                                                {districts.map(d => <option key={d}>{d}</option>)}
                                            </Form.Select>
                                        </Col>
                                        <Col md={4} xs={12}>
                                            <Form.Select name="store" value={form.store} onChange={handleChange} required style={{ textAlign: 'left' }}>
                                                <option value="">Chọn địa chỉ cửa hàng</option>
                                                {stores.map(s => <option key={s}>{s}</option>)}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Form.Control name="note" value={form.note} onChange={handleChange} placeholder="Địa chỉ chi tiết" className="mb-2" style={{ textAlign: 'left' }} />
                                    <Form.Control name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú khác (nếu có)" className="mb-2" style={{ textAlign: 'left' }} />
                                    <Card className="p-3 border-0 bg-light mb-2">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold" style={{ textAlign: 'left' }}>Tổng tiền tạm tính:</span>
                                            <span className="fs-5 text-danger fw-bold">{orderItems[0].price.toLocaleString()}đ</span>
                                        </div>
                                        <Button type="submit" variant="danger" className="w-100 fw-bold" style={{ fontSize: 18 }}>Tiếp tục</Button>
                                    </Card>
                                </div>
                            </Form>
                        )}

                        {step === 2 && (
                            <Form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <i className="bi bi-credit-card fs-1 text-danger mb-2 d-block" style={{ textAlign: 'left' }}></i>
                                    <div className="fw-bold fs-4 mb-2" style={{ textAlign: 'left' }}>Xác nhận & Thanh toán</div>
                                </div>
                                <Card className="mb-3 border-0 bg-light p-3 d-flex flex-row align-items-center">
                                    <Image src={orderItems[0].image} width={70} height={70} rounded className="me-3" />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold" style={{ textAlign: 'left' }}>{orderItems[0].name}</div>
                                        <div className="text-danger fw-bold" style={{ fontSize: 18, textAlign: 'left' }}>{orderItems[0].price.toLocaleString()}đ</div>
                                    </div>
                                    <div className="ms-3" style={{ textAlign: 'right' }}>Số lượng: <span className="fw-bold">{orderItems[0].quantity}</span></div>
                                </Card>
                                <div className="mb-3">
                                    <div className="fw-bold mb-2" style={{ textAlign: 'left' }}>Thông tin nhận hàng</div>
                                    <div style={{ textAlign: 'left' }}>Họ tên: <span className="fw-bold">{form.name}</span></div>
                                    <div style={{ textAlign: 'left' }}>SĐT: <span className="fw-bold">{form.phone}</span></div>
                                    <div style={{ textAlign: 'left' }}>Email: <span className="fw-bold">{form.email}</span></div>
                                    <div style={{ textAlign: 'left' }}>Địa chỉ: <span className="fw-bold">{form.province}, {form.district}, {form.store}</span></div>
                                    {form.note && <div style={{ textAlign: 'left' }}>Ghi chú: <span className="fw-bold">{form.note}</span></div>}
                                </div>

                                {/* Hình thức thanh toán */}
                                <div className="mb-3">
                                    <div className="fw-bold mb-2" style={{ textAlign: 'left' }}>Chọn hình thức thanh toán</div>
                                    <div className="text-start">
                                        <Form.Check
                                            type="radio"
                                            label="Thanh toán qua mã QR (Internet Banking, App ngân hàng, ví điện tử)"
                                            name="paymentMethod"
                                            value="qr"
                                            checked={form.paymentMethod === "qr"}
                                            onChange={handleChange}
                                            className="mb-2"
                                            id="pay-qr"
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Thanh toán tiền mặt khi nhận hàng"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={form.paymentMethod === "cash"}
                                            onChange={handleChange}
                                            id="pay-cash"
                                        />
                                    </div>
                                    {form.paymentMethod === "qr" && (
                                        <div className="mt-3 text-center">
                                            <div className="mb-2">Quét mã QR để thanh toán</div>
                                            <img src="https://img.vietqr.io/image/970422-123456789-compact2.jpg?amount=15490000&addInfo=ThanhToanDonHang" alt="QR code" style={{ width: 180, border: '1px solid #eee', borderRadius: 8 }} />
                                            <div className="small text-muted mt-1">Sử dụng app ngân hàng hoặc ví điện tử để quét mã</div>
                                        </div>
                                    )}
                                </div>

                                <Card className="p-3 border-0 bg-light mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold" style={{ textAlign: 'left' }}>Tổng tiền thanh toán:</span>
                                        <span className="fs-5 text-danger fw-bold">{orderItems[0].price.toLocaleString()}đ</span>
                                    </div>
                                    <Button type="submit" variant="danger" className="w-100 fw-bold" style={{ fontSize: 18 }}>Thanh toán</Button>
                                </Card>
                            </Form>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
