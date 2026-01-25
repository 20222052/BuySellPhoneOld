import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Badge, Image, Nav, OverlayTrigger, Tooltip, Form, Table, Modal, Spinner } from "react-bootstrap";
import UserService from "../../services/userService";
import CheckoutService from "../../services/checkoutService";
import diagnosticService from "../../services/diagnosticService";
import AddressService from "../../services/addressService";
import LocationService from "../../services/locationService";
import api from "../../services/apiClient";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const sidebar = [
    { icon: "bi bi-house-door", label: "Tổng quan", id: "overview" },
    { icon: "bi bi-clock-history", label: "Lịch sử mua hàng", id: "orders" },
    { icon: "bi bi-arrow-repeat", label: "Lịch sử Thu cũ", id: "trade-in" },
    { icon: "bi bi-person-lines-fill", label: "Thông tin tài khoản", id: "account" },
    { icon: "bi bi-geo-alt", label: "Sổ địa chỉ", id: "address" },
    { icon: "bi bi-box-arrow-right", label: "Đăng xuất", id: "logout" },
];

export default function Profile() {
    const [activeTab, setActiveTab] = useState("overview");
    const [editMode, setEditMode] = useState(false);

    // User data state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data lists
    const [orders, setOrders] = useState([]);
    const [tradeIns, setTradeIns] = useState([]);
    const [addresses, setAddresses] = useState([]);

    // Edit form state
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        avatarUrl: ""
    });

    // Detail Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTradeInModal, setShowTradeInModal] = useState(false);
    const [selectedTradeIn, setSelectedTradeIn] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // Address Modal State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [addressForm, setAddressForm] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        cityCode: "",
        districtCode: "",
        wardCode: "",
        isDefault: false
    });

    // Navigation
    const navigate = useNavigate();

    // Fetch user info on mount
    useEffect(() => {
        fetchUserInfo();
        fetchProvinces();
    }, []);

    // Fetch data based on active tab
    useEffect(() => {
        if (!user) return; // Ensure user is loaded before fetching user-specific data
        if (activeTab === "orders") fetchOrders();
        if (activeTab === "trade-in") fetchTradeIns();
        if (activeTab === "address") fetchAddresses();
    }, [activeTab, user]);
    

    const fetchUserInfo = async () => {
        try {
            const response = await UserService.getMyInfo();
            if (response && response.data) {
                const userData = response.data;
                setUser(userData);
                setFormData({
                    fullName: userData.fullName || "",
                    phone: userData.phone || "",
                    email: userData.email || "",
                    avatarUrl: userData.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Không thể tải thông tin tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const response = await CheckoutService.getOrdersByUserId(user.id);
            if (response && response.data) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    const fetchTradeIns = async () => {
        try {
            const response = await diagnosticService.getMyHistory();
            if (response && response.data) {
                setTradeIns(response.data);
            } else if (Array.isArray(response)) {
                setTradeIns(response);
            }
        } catch (error) {
            console.error("Failed to fetch trade-in history:", error);
        }
    };

    const fetchAddresses = async () => {
        if (!user) return;
        try {
            const response = await AddressService.getAddressesByUserId(user.id);
            if (response && response.data) {
                setAddresses(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        }
    };

    // Location Handlers
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
            setSaveLoading(true);
            await AddressService.createAddress({
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
            fetchAddresses();
        } catch (err) {
            toast.error(err.message || "Không thể thêm địa chỉ");
        } finally {
            setSaveLoading(false);
        }
    };

    // Detail Handlers
    const handleViewOrder = async (orderId) => {
        try {
            setDetailLoading(true);
            const res = await CheckoutService.getOrderById(orderId);
            if (res && res.data) {
                setSelectedOrder(res.data);
                setShowOrderModal(true);
            }
        } catch (error) {
            toast.error("Không thể xem chi tiết đơn hàng");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewTradeIn = async (tradeInId) => {
        try {
            setDetailLoading(true);
            const res = await diagnosticService.getDiagnosticById(tradeInId);
            if (res) {
                setSelectedTradeIn(res);
                setShowTradeInModal(true);
            }
        } catch (error) {
            toast.error("Không thể xem chi tiết thẩm định");
        } finally {
            setDetailLoading(false);
        }
    };

    const getLatestItem = (list) => {
        if (!list || list.length === 0) return null;
        // Assuming list is sorted desc or we just take first/last based on structure. 
        // If sorting needed: return list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        // But backend usually returns sorted. Let's assume list[0] is latest if sorted DESC, or check dates.
        return list[0];
    };

    // Handle Image Upload
    const handleImageClick = () => {
        if (editMode && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations (size, type) can be added here

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            // Call Upload API directly or via service
            // Assuming endpoint is POST /upload/image
            const response = await api.post("/upload/image", formDataUpload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data && response.data.data) {
                const newAvatarUrl = response.data.data.url;
                setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
                toast.success("Tải ảnh lên thành công!");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Tải ảnh thất bại. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    // Save Profile
    const handleSave = async () => {
        try {
            const updatePayload = {
                fullName: formData.fullName,
                phone: formData.phone,
                // Email is usually read-only or requires verify, assume editable for now or backend ignores if same
                // email: formData.email, 
                avatarUrl: formData.avatarUrl
            };

            const response = await UserService.update(user.id, updatePayload);

            // Validate response
            if (response && response.data) {
                setUser(response.data); // Update local user state
                localStorage.setItem("user", JSON.stringify(response.data)); // Sync local storage if needed
                toast.success("Cập nhật thông tin thành công!");
                setEditMode(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.message || "Không thể cập nhật thông tin.");
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        // Reset form to current user data
        setFormData({
            fullName: user.fullName || "",
            phone: user.phone || "",
            email: user.email || "",
            avatarUrl: user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
    };

    // Address Actions
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await AddressService.deleteAddress(addressId);
                toast.success("Đã xóa địa chỉ thành công.");
                fetchAddresses(); // Refresh list
            } catch (error) {
                console.error("Delete address failed:", error);
                toast.error("Không thể xóa địa chỉ.");
            }
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await AddressService.setDefaultAddress(user.id, addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            fetchAddresses(); // Refresh list
        } catch (error) {
            console.error("Set default address failed:", error);
            toast.error("Không thể đặt địa chỉ mặc định.");
        }
    };

    // Logout
    const handleLogout = async () => {
        try {
          await dispatch(logoutUser()).unwrap();
          navigate("/login");
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    if (!user) {
        return <Container className="py-5 text-center">
            <div className="alert alert-warning">Vui lòng đăng nhập để xem thông tin.</div>
        </Container>;
    }

    return (
        <Container fluid className="py-4" style={{ background: "#f7f8fa", minHeight: "100vh" }}>
            <Row className="justify-content-center">
                {/* <Col md={3} lg={2} className="mb-3">
                    <Card className="border-0 shadow-sm p-2">
                        <ListGroup variant="flush">
                            {sidebar.map((item, idx) => (
                                <OverlayTrigger
                                    key={idx}
                                    placement="right"
                                    overlay={<Tooltip>{item.label}</Tooltip>}
                                >
                                    <ListGroup.Item
                                        action
                                        className={
                                            (activeTab === item.id ? "fw-bold text-danger bg-light" : "") + " d-flex align-items-center"
                                        }
                                        style={{ border: "none", background: "none", fontSize: 16, cursor: "pointer", borderRadius: 8, marginBottom: 2 }}
                                        onClick={() => {
                                            if (item.id === "logout") {
                                                handleLogout();
                                                return;
                                            }
                                            setActiveTab(item.id);
                                        }}
                                    >
                                        <i className={item.icon + " me-2"}></i>
                                        <span className="d-none d-md-inline">{item.label}</span>
                                    </ListGroup.Item>
                                </OverlayTrigger>
                            ))}
                        </ListGroup>
                    </Card>
                </Col> */}
                <Col md={12} lg={10}>
                    {/* Header user info */}
                    <Card className="border-0 shadow-sm mb-3 p-3 text-start">
                        <Row className="align-items-center">
                            <Col xs={3} sm={2} className="d-flex justify-content-center align-items-center position-relative">
                                <div
                                    className={`position-relative ${editMode ? 'cursor-pointer' : ''}`}
                                    onClick={handleImageClick}
                                    title={editMode ? "Nhấn để đổi ảnh đại diện" : ""}
                                >
                                    <Image
                                        src={formData.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                        roundedCircle
                                        width={80}
                                        height={80}
                                        alt="avatar"
                                        className="object-fit-cover border"
                                        style={{ opacity: uploading ? 0.5 : 1 }}
                                    />
                                    {editMode && (
                                        <div className="position-absolute bottom-0 end-0 bg-white border rounded-circle p-1 shadow-sm" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-camera-fill text-dark" style={{ fontSize: 12 }}></i>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="d-none"
                                    onChange={handleFileChange}
                                />
                            </Col>
                            <Col xs={9} sm={7} className="ps-3">
                                {editMode ? (
                                    <Form>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                placeholder="Họ tên"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Số điện thoại"
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Control
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                placeholder="Email"
                                            />
                                        </Form.Group>
                                    </Form>
                                ) : (
                                    <>
                                        <div className="fw-bold" style={{ fontSize: 20 }}>{user.fullName || " Chưa cập nhật tên"}</div>
                                        <div className="text-muted small">
                                            {user.phone || "Chưa có SĐT"}
                                            {/* <Badge bg="success" className="ms-2">Member</Badge> */}
                                        </div>
                                        <div className="small">Thành viên từ: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}</div>
                                        <div className="small text-muted">{user.email}</div>
                                    </>
                                )}
                            </Col>
                            <Col xs={12} sm={3} className="text-end mt-3 mt-sm-0">
                                {/* <div className="fw-bold text-danger" style={{ fontSize: 22 }}>0đ</div>
                                <div className="small text-muted">Tổng tích lũy</div> */}
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    {editMode ? (
                                        <>
                                            <Button variant="outline-secondary" size="sm" onClick={handleCancel}>Hủy</Button>
                                            <Button variant="success" size="sm" onClick={handleSave}>Lưu</Button>
                                        </>
                                    ) : (
                                        <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>Cập nhật</Button>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tab Navigation (Optional, synced with sidebar) */}
                    <Nav variant="tabs" className="mb-3 d-none d-md-flex">
                        <Nav.Item>
                            <Nav.Link active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Tổng quan</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Lịch sử mua hàng</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={activeTab === "trade-in"} onClick={() => setActiveTab("trade-in")}>Lịch sử thu cũ</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={activeTab === "address"} onClick={() => setActiveTab("address")}>Sổ địa chỉ</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Row>
                        <Col md={12}>
                            {/* Content Render */}
                            {activeTab === "overview" && (
                                <div>
                                    <h5 className="mb-3">Tổng quan tài khoản</h5>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Card className="h-100 shadow-sm border-0">
                                                <Card.Body>
                                                    <h6 className="card-title text-muted">Đơn hàng gần nhất</h6>
                                                    {orders.length > 0 ? (
                                                        <div>
                                                            <div className="fw-bold fs-5 text-primary">#{orders[0]?.orderCode}</div>
                                                            <div className="small text-muted">{new Date(orders[0]?.createdAt).toLocaleDateString("vi-VN")}</div>
                                                            <div className="mt-2">
                                                                <Badge bg="info">{orders[0]?.status}</Badge>
                                                                <span className="ms-2 fw-bold text-danger">{formatCurrency(orders[0]?.total)}</span>
                                                            </div>
                                                            <Button variant="link" size="sm" className="p-0 mt-2" onClick={() => handleViewOrder(orders[0]?.orderId)}>Xem chi tiết &rarr;</Button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted small">Chưa có đơn hàng nào</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Card className="h-100 shadow-sm border-0">
                                                <Card.Body>
                                                    <h6 className="card-title text-muted">Lịch sử Thu cũ gần nhất</h6>
                                                    {tradeIns.length > 0 ? (
                                                        <div>
                                                            <div className="fw-bold">{tradeIns[0]?.productItemId ? tradeIns[0].productItemId.substring(0, 8) : 'Thiết bị'}...</div>
                                                            <div className="small text-muted">{new Date(tradeIns[0]?.testDate).toLocaleDateString("vi-VN")}</div>
                                                            <div className="mt-2">
                                                                <Badge bg="warning" text="dark">{tradeIns[0]?.overallAssessment}</Badge>
                                                                <span className="ms-2 fw-bold text-danger">-{tradeIns[0]?.totalDepreciation}%</span>
                                                            </div>
                                                            <Button variant="link" size="sm" className="p-0 mt-2" onClick={() => handleViewTradeIn(tradeIns[0]?.id)}>Xem chi tiết &rarr;</Button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted small">Chưa có giao dịch thu cũ nào</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={12}>
                                            <Card className="shadow-sm border-0">
                                                <Card.Body>
                                                    <h6 className="card-title text-muted">Địa chỉ mặc định</h6>
                                                    {addresses.find(a => a.isDefault) ? (
                                                        <div>
                                                            <strong>{addresses.find(a => a.isDefault).fullName}</strong> - {addresses.find(a => a.isDefault).phone}
                                                            <div className="text-muted small">{addresses.find(a => a.isDefault).fullAddress || `${addresses.find(a => a.isDefault).addressLine}, ${addresses.find(a => a.isDefault).wardName}, ${addresses.find(a => a.isDefault).districtName}, ${addresses.find(a => a.isDefault).cityName}`}</div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted small">Chưa thiết lập địa chỉ mặc định</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <Card className="border-0 shadow-sm p-3 text-start">
                                    <h5 className="mb-3">Lịch sử đơn hàng</h5>
                                    {orders.length === 0 ? (
                                        <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
                                    ) : (
                                        orders.map(order => (
                                            <div key={order.orderId} className="mb-3 pb-3 border-bottom cursor-pointer card-hover p-2 rounded" onClick={() => handleViewOrder(order.orderId)} style={{ cursor: 'pointer' }}>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <strong>#{order.orderCode}</strong>
                                                        <span className="ms-2 badge bg-primary">{order.status}</span>
                                                    </div>
                                                    <div className="text-danger fw-bold">{formatCurrency(order.total)}</div>
                                                </div>
                                                <div className="small text-muted">
                                                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                <div className="small text-muted">
                                                    {order.shippingAddress && `Giao tới: ${order.shippingAddress.fullAddress}`}
                                                </div>
                                                <div className="text-end df-none">
                                                    <small className="text-primary">Nhấn để xem chi tiết</small>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </Card>
                            )}

                            {activeTab === "trade-in" && (
                                <Card className="border-0 shadow-sm p-3 text-start">
                                    <h5 className="mb-3">Lịch sử Thu cũ đổi mới</h5>
                                    {tradeIns.length === 0 ? (
                                        <p className="text-muted">Bạn chưa có yêu cầu thu cũ nào.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th>Ngày test</th>
                                                        <th>Đánh giá</th>
                                                        <th>Định giá</th>
                                                        <th>Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tradeIns.map((item) => (
                                                        <tr key={item.id} onClick={() => handleViewTradeIn(item.id)} style={{ cursor: "pointer" }}>
                                                            <td>
                                                                {/* Ideally product name, but might only have ID or generic name */}
                                                                ID: {item.productItemId ? item.productItemId.substring(0, 8) : 'N/A'}
                                                            </td>
                                                            <td>{item.testDate}</td>
                                                            <td>{item.overallAssessment}</td>
                                                            <td className="text-danger fw-bold">
                                                                {/* Estimated cost logic might be needed if field is null */}
                                                                {item.estimatedRepairCost ? formatCurrency(item.estimatedRepairCost) : 'Đang cập nhật'}
                                                            </td>
                                                            <td><Badge bg="info">{item.status}</Badge></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {activeTab === "address" && (
                                <Card className="border-0 shadow-sm p-3 text-start">
                                    <div className="d-flex justify-content-between mb-3">
                                        <h5 className="mb-0">Sổ địa chỉ</h5>
                                        <Button size="sm" variant="outline-primary" onClick={() => setShowAddressModal(true)}><i className="bi bi-plus"></i> Thêm mới</Button>
                                    </div>
                                    {addresses.length === 0 ? (
                                        <p className="text-muted">Bạn chưa lưu địa chỉ nào.</p>
                                    ) : (
                                        addresses.map((addr) => (
                                            <div key={addr.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                <div>
                                                    <div>
                                                        <strong>{addr.fullName}</strong> - {addr.phone}
                                                        {addr.isDefault && <Badge bg="success" className="ms-2">Mặc định</Badge>}
                                                    </div>
                                                    <div className="small text-muted">{addr.addressLine}, {addr.wardName}, {addr.districtName}, {addr.cityName}</div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    {!addr.isDefault && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline-secondary"
                                                            onClick={() => handleSetDefaultAddress(addr.id)}
                                                            title="Đặt làm mặc định"
                                                        >
                                                            Mặc định
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="text-danger"
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </Card>
                            )}
                        </Col>
                    </Row>
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
                        <Button variant="danger" type="submit" disabled={saveLoading}>
                            {saveLoading ? <Spinner size="sm" /> : "Lưu địa chỉ"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>



            {/* Order Detail Modal */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đơn hàng #{selectedOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : selectedOrder ? (
                        <div>
                            <div className="mb-3">
                                <h6>Thông tin nhận hàng</h6>
                                <p className="mb-1"><strong>Người nhận:</strong> {selectedOrder.shippingAddress?.fullName}</p>
                                <p className="mb-1"><strong>SĐT:</strong> {selectedOrder.shippingAddress?.phone}</p>
                                <p className="mb-1"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.fullAddress}</p>
                                {selectedOrder.note && <p className="mb-1 text-muted">Ghi chú: {selectedOrder.note}</p>}
                            </div>
                            <Table responsive size="sm">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th>SL</th>
                                        <th className="text-end">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div>{item.productName}</div>
                                                <small className="text-muted">{item.productModelName} - {item.colorName}</small>
                                            </td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                            <td>{item.quantity}</td>
                                            <td className="text-end">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="text-end fw-bold">Tổng tiền:</td>
                                        <td className="text-end fw-bold text-danger fs-5">{formatCurrency(selectedOrder.total)}</td>
                                    </tr>
                                </tfoot>
                            </Table>
                            <div className="d-flex justify-content-between mt-3">
                                <div>
                                    Trạng thái: <Badge bg="primary">{selectedOrder.status}</Badge>
                                </div>
                                <div>
                                    Thanh toán: <Badge bg="secondary">{selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}</Badge>
                                </div>
                            </div>
                        </div>
                    ) : <p>Không tìm thấy thông tin đơn hàng</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOrderModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* Trade-In Detail Modal */}
            <Modal show={showTradeInModal} onHide={() => setShowTradeInModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Kết quả thẩm định của máy cũ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : selectedTradeIn ? (
                        <Row>
                            <Col md={12}>
                                <div className="alert alert-info d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0">Đánh giá: {selectedTradeIn.overallAssessment}</h5>
                                        <small>Ngày kiểm tra: {new Date(selectedTradeIn.testDate).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                    <h3 className="text-danger mb-0">-{selectedTradeIn.totalDepreciation}%</h3>
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6>Chi tiết khấu hao:</h6>
                                <ListGroup variant="flush">
                                    {selectedTradeIn.screenCracks > 0 && <ListGroup.Item className="d-flex justify-content-between"><span>Nứt màn hình</span><Badge bg="danger">Có</Badge></ListGroup.Item>}
                                    {selectedTradeIn.scratches > 0 && <ListGroup.Item className="d-flex justify-content-between"><span>Trầy xước</span><Badge bg="warning">Cấp {selectedTradeIn.scratches}</Badge></ListGroup.Item>}
                                    {selectedTradeIn.dents > 0 && <ListGroup.Item className="d-flex justify-content-between"><span>Cấn móp</span><Badge bg="warning">Cấp {selectedTradeIn.dents}</Badge></ListGroup.Item>}
                                    {selectedTradeIn.displayFailure && <ListGroup.Item className="d-flex justify-content-between"><span>Lỗi hiển thị</span><Badge bg="danger">Có</Badge></ListGroup.Item>}
                                    {/* Functional checks */}
                                    {selectedTradeIn.microphoneDamage && <ListGroup.Item className="d-flex justify-content-between"><span>Microphone</span><Badge bg="danger">Hỏng</Badge></ListGroup.Item>}
                                    {selectedTradeIn.frontCameraDamage && <ListGroup.Item className="d-flex justify-content-between"><span>Camera trước</span><Badge bg="danger">Hỏng</Badge></ListGroup.Item>}
                                    {selectedTradeIn.rearCameraDamage && <ListGroup.Item className="d-flex justify-content-between"><span>Camera sau</span><Badge bg="danger">Hỏng</Badge></ListGroup.Item>}
                                    {selectedTradeIn.batteryHealth < 80 && <ListGroup.Item className="d-flex justify-content-between"><span>Pin ({selectedTradeIn.batteryHealth}%)</span><Badge bg="warning">Chai</Badge></ListGroup.Item>}
                                </ListGroup>
                            </Col>
                            <Col md={6}>
                                <h6>Hình ảnh thiết bị:</h6>
                                <p className="text-muted small">Hình ảnh đã được gửi lên hệ thống AI.</p>

                                <div className="mt-3">
                                    <h6>Ghi chú:</h6>
                                    <p className="small text-muted">{selectedTradeIn.additionalNotes || "Không có ghi chú"}</p>
                                </div>
                            </Col>
                        </Row>
                    ) : <p>Không tìm thấy thông tin thẩm định</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTradeInModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </Container >
    );
}
