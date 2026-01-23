import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Image, Modal, Spinner, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LocationService from "../../services/locationService";
import AddressService from "../../services/addressService";
import CheckoutService from "../../services/checkoutService";
import CartService from "../../services/cartService";

export default function CheckOut() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { items: cartItems, totalPrice } = useSelector((state) => state.cart);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [orderResult, setOrderResult] = useState(null);

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Location dropdowns
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // New address form
    const [addressForm, setAddressForm] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        isDefault: false
    });

    // Customer info & payment
    const [form, setForm] = useState({
        note: "",
        paymentMethod: "cod"
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.warning("Vui lòng đăng nhập để thanh toán");
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // Fetch addresses and provinces on mount
    useEffect(() => {
        if (user?.id) {
            fetchAddresses();
        }
        fetchProvinces();
    }, [user?.id]);

    // Fetch cart if empty
    useEffect(() => {
        if (cartItems.length === 0 && !submitted) {
            navigate("/cart");
        }
    }, [cartItems, navigate, submitted]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await AddressService.getAddressesByUserId(user.id);
            setAddresses(res.data || []);
            // Auto-select default address
            const defaultAddr = res.data?.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await LocationService.getProvinces();
            setProvinces(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProvinceChange = async (code) => {
        setAddressForm(f => ({ ...f, cityCode: code, districtCode: "", wardCode: "" }));
        setDistricts([]);
        setWards([]);
        if (code) {
            try {
                const res = await LocationService.getDistrictsByProvince(code);
                setDistricts(res.data || []);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDistrictChange = async (code) => {
        setAddressForm(f => ({ ...f, districtCode: code, wardCode: "" }));
        setWards([]);
        if (code) {
            try {
                const res = await LocationService.getWardsByDistrict(code);
                setWards(res.data || []);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddressFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await AddressService.createAddress({
                ...addressForm,
                userId: user.id
            });
            toast.success("Thêm địa chỉ thành công!");
            setShowAddressModal(false);
            setAddressForm({
                fullName: "",
                phone: "",
                addressLine: "",
                cityCode: "",
                districtCode: "",
                wardCode: "",
                isDefault: false
            });
            await fetchAddresses();
            if (res.data?.id) {
                setSelectedAddressId(res.data.id);
            }
        } catch (err) {
            toast.error(err.message || "Không thể thêm địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (!selectedAddressId) {
            toast.warning("Vui lòng chọn hoặc thêm địa chỉ giao hàng");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAddressId) {
            toast.error("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        try {
            setSubmitting(true);
            const res = await CheckoutService.checkout({
                userId: user.id,
                addressId: selectedAddressId,
                paymentMethod: form.paymentMethod,
                note: form.note
            });
            console.log(res);
            if (res.code === 200 || res.code === 201) {
                setOrderResult(res.data);
                setSubmitted(true);
                toast.success(res.message || "Đặt hàng thành công!");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                toast.error(res.message || "Đặt hàng thất bại");
            }
        } catch (err) {
            toast.error(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price || 0);
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    // Success screen
    if (submitted && orderResult) {
        return (
            <Container className="py-4">
                <ToastContainer position="top-right" autoClose={3000} />
                <Card className="p-4 border-0 shadow-sm text-center">
                    <div className="mb-3">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 60 }}></i>
                    </div>
                    <h2 className="mb-3 text-success">Đặt hàng thành công!</h2>
                    <p className="mb-2">Mã đơn hàng: <strong>{orderResult.orderCode}</strong></p>
                    <p className="mb-3">Tổng tiền: <strong className="text-danger">{formatPrice(orderResult.total)}₫</strong></p>
                    <p className="text-muted mb-4">Cảm ơn bạn đã mua hàng tại PhoneZin. Đơn hàng của bạn sẽ được xử lý sớm nhất.</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="outline-primary" onClick={() => navigate("/orders")}>
                            Xem đơn hàng
                        </Button>
                        <Button variant="primary" onClick={() => navigate("/")}>
                            Về trang chủ
                        </Button>
                    </div>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ background: "#f7f8fa", minHeight: 600 }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Row className="justify-content-center">
                <Col md={8} lg={7}>
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        {/* Progress steps */}
                        <div className="d-flex align-items-center mb-4">
                            <Button variant="link" className="p-0 me-2" style={{ color: "#d70018" }}
                                disabled={step === 1} onClick={() => setStep(1)}>
                                <i className="bi bi-arrow-left fs-5"></i>
                            </Button>
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-center">
                                    <div className={step === 1 ? "fw-bold text-danger" : "fw-bold text-secondary"} style={{ fontSize: 18 }}>
                                        1. THÔNG TIN
                                    </div>
                                    <div className="mx-3" style={{ borderBottom: "2px solid #eee", width: 40 }}></div>
                                    <div className={step === 2 ? "fw-bold text-danger" : "fw-bold text-secondary"} style={{ fontSize: 18 }}>
                                        2. THANH TOÁN
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Information */}
                        {step === 1 && (
                            <Form onSubmit={handleContinue}>
                                {/* Cart Items */}
                                <div className="mb-3">
                                    <div className="fw-bold mb-2" style={{ textAlign: "left" }}>SẢN PHẨM ({cartItems.length})</div>
                                    {cartItems.map(item => (
                                        <Card key={item.id} className="mb-2 border-0 bg-light p-3 d-flex flex-row align-items-center">
                                            <Image
                                                src={item.productDetail?.media?.[0]?.url || "https://via.placeholder.com/70"}
                                                width={70} height={70} rounded className="me-3"
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold" style={{ textAlign: "left" }}>{item.productName}</div>
                                                <div className="small text-muted" style={{ textAlign: "left" }}>
                                                    {item.productModelName} / {item.colorName}
                                                </div>
                                                <div className="text-danger fw-bold" style={{ textAlign: "left" }}>
                                                    {formatPrice(item.unitPrice)}₫
                                                </div>
                                            </div>
                                            <div className="ms-3" style={{ textAlign: "right" }}>
                                                SL: <span className="fw-bold">{item.quantity}</span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Delivery Address */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fw-bold" style={{ textAlign: "left" }}>ĐỊA CHỈ GIAO HÀNG</div>
                                        <Button variant="link" size="sm" onClick={() => setShowAddressModal(true)}>
                                            <i className="bi bi-plus-circle"></i> Thêm địa chỉ
                                        </Button>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-3"><Spinner size="sm" /></div>
                                    ) : addresses.length === 0 ? (
                                        <Alert variant="info">
                                            Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ giao hàng.
                                        </Alert>
                                    ) : (
                                        <div>
                                            {addresses.map(addr => (
                                                <Card
                                                    key={addr.id}
                                                    className={`mb-2 p-3 cursor-pointer ${selectedAddressId === addr.id ? 'border-danger' : 'border'}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                >
                                                    <Form.Check
                                                        type="radio"
                                                        name="addressId"
                                                        checked={selectedAddressId === addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                        label={
                                                            <div className="ms-2">
                                                                <div className="fw-bold">
                                                                    {addr.fullName} - {addr.phone}
                                                                    {addr.isDefault && <span className="badge bg-success ms-2">Mặc định</span>}
                                                                </div>
                                                                <div className="small text-muted">{addr.fullAddress}</div>
                                                            </div>
                                                        }
                                                    />
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Note */}
                                <Form.Control
                                    name="note"
                                    value={form.note}
                                    onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
                                    placeholder="Ghi chú khác (nếu có)"
                                    className="mb-3"
                                />

                                {/* Total and Continue */}
                                <Card className="p-3 border-0 bg-light">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold">Tổng tiền tạm tính:</span>
                                        <span className="fs-5 text-danger fw-bold">{formatPrice(totalPrice)}₫</span>
                                    </div>
                                    <Button type="submit" variant="danger" className="w-100 fw-bold" style={{ fontSize: 18 }}
                                        disabled={!selectedAddressId}>
                                        Tiếp tục
                                    </Button>
                                </Card>
                            </Form>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <Form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <i className="bi bi-credit-card fs-1 text-danger mb-2 d-block"></i>
                                    <div className="fw-bold fs-4 mb-2">Xác nhận & Thanh toán</div>
                                </div>

                                {/* Order Items Summary */}
                                {cartItems.map(item => (
                                    <Card key={item.id} className="mb-2 border-0 bg-light p-3 d-flex flex-row align-items-center">
                                        <Image
                                            src={item.productDetail?.media?.[0]?.url || "https://via.placeholder.com/70"}
                                            width={70} height={70} rounded className="me-3"
                                        />
                                        <div className="flex-grow-1">
                                            <div className="fw-bold" style={{ textAlign: "left" }}>{item.productName}</div>
                                            <div className="text-danger fw-bold" style={{ textAlign: "left" }}>{formatPrice(item.unitPrice)}₫</div>
                                        </div>
                                        <div className="ms-3">SL: <span className="fw-bold">{item.quantity}</span></div>
                                    </Card>
                                ))}

                                {/* Shipping Info */}
                                <div className="mb-3 mt-4">
                                    <div className="fw-bold mb-2">Thông tin nhận hàng</div>
                                    {selectedAddress && (
                                        <>
                                            <div>Họ tên: <span className="fw-bold">{selectedAddress.fullName}</span></div>
                                            <div>SĐT: <span className="fw-bold">{selectedAddress.phone}</span></div>
                                            <div>Địa chỉ: <span className="fw-bold">{selectedAddress.fullAddress}</span></div>
                                        </>
                                    )}
                                    {form.note && <div>Ghi chú: <span className="fw-bold">{form.note}</span></div>}
                                </div>

                                {/* Payment Method */}
                                <div className="mb-3">
                                    <div className="fw-bold mb-2">Chọn hình thức thanh toán</div>
                                    <div className="text-start">
                                        <Form.Check
                                            type="radio"
                                            label="Thanh toán qua mã QR (Internet Banking, App ngân hàng, ví điện tử)"
                                            name="paymentMethod"
                                            value="bank_transfer"
                                            checked={form.paymentMethod === "bank_transfer"}
                                            onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                                            className="mb-2"
                                            id="pay-qr"
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Thanh toán tiền mặt khi nhận hàng (COD)"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={form.paymentMethod === "cod"}
                                            onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                                            id="pay-cash"
                                        />
                                    </div>
                                    {form.paymentMethod === "bank_transfer" && (
                                        <div className="mt-3 text-center">
                                            <div className="mb-2">Quét mã QR để thanh toán</div>
                                            <img
                                                src={`https://img.vietqr.io/image/970422-123456789-compact2.jpg?amount=${totalPrice}&addInfo=ThanhToanDonHang`}
                                                alt="QR code"
                                                style={{ width: 180, border: "1px solid #eee", borderRadius: 8 }}
                                            />
                                            <div className="small text-muted mt-1">Sử dụng app ngân hàng hoặc ví điện tử để quét mã</div>
                                        </div>
                                    )}
                                </div>

                                {/* Total and Submit */}
                                <Card className="p-3 border-0 bg-light">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold">Tổng tiền thanh toán:</span>
                                        <span className="fs-5 text-danger fw-bold">{formatPrice(totalPrice)}₫</span>
                                    </div>
                                    <Button type="submit" variant="danger" className="w-100 fw-bold" style={{ fontSize: 18 }}
                                        disabled={submitting}>
                                        {submitting ? <Spinner size="sm" /> : "Đặt hàng"}
                                    </Button>
                                </Card>
                            </Form>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Add Address Modal */}
            <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm địa chỉ mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveAddress}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control
                                    name="fullName"
                                    value={addressForm.fullName}
                                    onChange={handleAddressFormChange}
                                    required
                                    placeholder="Nhập họ tên"
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressFormChange}
                                    required
                                    placeholder="Nhập số điện thoại"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label>Tỉnh/Thành phố</Form.Label>
                                <Form.Select
                                    value={addressForm.cityCode}
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                    required
                                >
                                    <option value="">Chọn tỉnh/thành</option>
                                    {provinces.map(p => (
                                        <option key={p.idProvince} value={p.idProvince}>{p.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label>Quận/Huyện</Form.Label>
                                <Form.Select
                                    value={addressForm.districtCode}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    required
                                    disabled={!addressForm.cityCode}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map(d => (
                                        <option key={d.idDistrict} value={d.idDistrict}>{d.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label>Phường/Xã</Form.Label>
                                <Form.Select
                                    name="wardCode"
                                    value={addressForm.wardCode}
                                    onChange={handleAddressFormChange}
                                    required
                                    disabled={!addressForm.districtCode}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map(w => (
                                        <option key={w.idCommune} value={w.idCommune}>{w.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={12}>
                                <Form.Label>Địa chỉ chi tiết</Form.Label>
                                <Form.Control
                                    name="addressLine"
                                    value={addressForm.addressLine}
                                    onChange={handleAddressFormChange}
                                    required
                                    placeholder="Số nhà, tên đường..."
                                />
                            </Col>
                            <Col md={12}>
                                <Form.Check
                                    type="checkbox"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressFormChange}
                                    label="Đặt làm địa chỉ mặc định"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddressModal(false)}>Hủy</Button>
                        <Button variant="danger" type="submit" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "Lưu địa chỉ"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}
