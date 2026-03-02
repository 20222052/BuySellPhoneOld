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

const WEIGHTS = {
    screenCracks: 0.25, scratches: 0.15, edgeDings: 0.10,
    dents: 0.10, displayFailure: 0.20, deadPixels: 0.10, displayLines: 0.10
};

const FUNCTIONAL_PENALTIES = {
    microphoneDamage: 5, frontCameraDamage: 10, rearCameraDamage: 15,
    chargingPortDamage: 10, speakerDamage: 5, buttonDamage: 5,
    wifiBluetoothIssue: 15
};

const getCosmeticDeduction = (key, score) => {
    const weight = WEIGHTS[key] || 0;
    return (score * weight).toFixed(1);
};

function getLabel(key) {
    const labels = {
        screenCracks: "Nứt vỡ màn hình",
        scratches: "Trầy xước màn hình/thân",
        edgeDings: "Cấn móp cạnh",
        dents: "Móp méo thân vỏ",
        displayFailure: "Lỗi hiển thị",
        deadPixels: "Điểm chết",
        displayLines: "Sọc màn hình",
        microphoneDamage: "Hỏng Microphone",
        frontCameraDamage: "Hỏng Camera trước",
        rearCameraDamage: "Hỏng Camera sau",
        chargingPortDamage: "Hỏng chân sạc",
        speakerDamage: "Hỏng loa",
        buttonDamage: "Hỏng phím cứng",
        wifiBluetoothIssue: "Lỗi Wifi/Bluetooth",
        battery: "Pin chai (<80%)"
    };
    return labels[key] || key;
}

export default function Profile() {
    const [activeTab, setActiveTab] = useState("overview");
    const [editMode, setEditMode] = useState(false);

    // Helper functions
    const formatAccountName = (str) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toUpperCase()
            .replace(/[^A-Z0-C\s]/g, ""); // Allow only letters and spaces (optional logic, kept simple)
    };

    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

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
        avatarUrl: "",
        bankName: "",
        accountName: "",
        bankAccount: ""
    });

    // Detail Modal State
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTradeInModal, setShowTradeInModal] = useState(false);
    const [selectedTradeIn, setSelectedTradeIn] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Bank Info Modal State
    const [showBankInfoModal, setShowBankInfoModal] = useState(false);
    const [bankInfoForm, setBankInfoForm] = useState({ bankName: "", accountName: "", bankAccount: "" });
    const [bankInfoLoading, setBankInfoLoading] = useState(false);

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
                    avatarUrl: userData.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                    bankName: userData.bankName || "",
                    accountName: userData.accountName || "",
                    bankAccount: userData.bankAccount || ""
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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
        try {
            setDetailLoading(true);
            const res = await CheckoutService.cancelOrder(orderId);
            if (res && res.data) {
                toast.success("Hủy đơn hàng thành công!");
                fetchOrders(); // refresh order list
                setSelectedOrder(res.data); // update modal with new status
            }
        } catch (error) {
            console.error("Cancel order failed:", error);
            const errorMessage = error.response?.data?.message || error.message;
            if (errorMessage.includes("vui lòng cung cấp thông tin tài khoản ngân hàng")) {
                toast.error(errorMessage);
                // Switch to overview tab, enable edit mode or maybe we should add a bank info form...
                // For now, let's open a modal or prompt them to update profile. We'll add a Bank Info modal later if needed.
                // Wait, the user wants us to "hiển thị thông báo yêu cầu khách hàng bổ sung thông tin hoàn tiền". 
                // We'll add a dedicated UI for bank info or scroll to it. But maybe simpler is to just close the order modal and switch to a bank info modal.
                setShowOrderModal(false);
                setShowBankInfoModal(true);
            } else {
                toast.error(errorMessage || "Không thể hủy đơn hàng.");
            }
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
                const newAvatarUrl = response.data.data.secureUrl;
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

            // Cập nhật thông tin ngân hàng qua API riêng biệt
            let updatedUser = response?.data;
            if (formData.bankName || formData.accountName || formData.bankAccount) {
                const bankPayload = {
                    bankName: formData.bankName,
                    accountName: formData.accountName,
                    bankAccount: formData.bankAccount
                };
                try {
                    const bankRes = await UserService.updateBankInfo(bankPayload);
                    updatedUser = bankRes?.data || updatedUser;
                } catch (bankErr) {
                    console.error("Bank update failed:", bankErr);
                    toast.warning("Cập nhật thông tin cá nhân thành công, nhưng lỗi khi cập nhật TT Ngân hàng.");
                }
            } else if (!formData.bankName && !formData.accountName && !formData.bankAccount && (user.bankName || user.accountName || user.bankAccount)) {
                // Nếu người dùng xóa hết tt ngân hàng, gọi API delete
                try {
                    await api.delete('/users/my-profile/bank-info');
                    // Fetch lại user mới nhất
                    const myInfo = await UserService.getMyInfo();
                    updatedUser = myInfo?.data || updatedUser;
                } catch (delErr) {
                    console.error("Bank delete failed:", delErr);
                }
            }

            // Validate response
            if (updatedUser) {
                setUser(updatedUser); // Update local user state
                localStorage.setItem("user", JSON.stringify(updatedUser)); // Sync local storage if needed
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
            avatarUrl: user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            bankName: user.bankName || "",
            accountName: user.accountName || "",
            bankAccount: user.bankAccount || ""
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        // Frontend validation trước khi gọi API
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        try {
            setPasswordLoading(true);
            await UserService.changePassword(user.id, passwordForm);
            toast.success("Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error?.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSaveBankInfo = async (e) => {
        e.preventDefault();
        if (!bankInfoForm.bankName || !bankInfoForm.accountName || !bankInfoForm.bankAccount) {
            toast.error("Vui lòng điền đầy đủ thông tin ngân hàng!");
            return;
        }
        try {
            setBankInfoLoading(true);
            await UserService.updateBankInfo(bankInfoForm);

            // Cập nhật lại user cục bộ
            const userRes = await UserService.getMyInfo();
            if (userRes && userRes.data) {
                setUser(userRes.data);
                localStorage.setItem("user", JSON.stringify(userRes.data));
            }

            toast.success("Cập nhật thông tin ngân hàng thành công!");
            setShowBankInfoModal(false);

            // Mở lại modal đơn hàng nếu đang mở dở (ví dụ vừa hủy lỗi)
            if (activeTab === "orders" && selectedOrder) {
                handleCancelOrder(selectedOrder.orderId); // Thử hủy lại tự động luôn hoặc chỉ báo thành công
                setShowOrderModal(true);
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật thông tin ngân hàng.");
            console.error(error);
        } finally {
            setBankInfoLoading(false);
        }
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
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                placeholder="Email"
                                            />
                                        </Form.Group>
                                        <hr className="my-2" />
                                        <div className="fw-bold fs-6 mb-2 text-primary">Thông tin nhận hoàn tiền (nếu có)</div>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                value={formData.bankName}
                                                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                                placeholder="Tên ngân hàng (vd: Vietcombank)"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                value={formData.accountName}
                                                onChange={e => setFormData({ ...formData, accountName: formatAccountName(e.target.value) })}
                                                placeholder="Tên chủ tài khoản"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                value={formData.bankAccount}
                                                onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                                                placeholder="Số tài khoản"
                                            />
                                        </Form.Group>
                                    </Form>
                                ) : (
                                    <>
                                        <div className="fw-bold" style={{ fontSize: 20 }}>{user.fullName || " Chưa cập nhật tên"}</div>
                                        <div className="text-muted small">
                                            {user.phone || "Chưa có SĐT"}
                                        </div>
                                        <div className="small">Thành viên từ: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}</div>
                                        <div className="small text-muted mb-2">{user.email}</div>

                                        {(user.bankName || user.bankAccount || user.accountName) && (
                                            <div className="p-2 bg-light rounded shadow-sm d-inline-block border" style={{ fontSize: '13px' }}>
                                                <div className="fw-bold text-success mb-1">
                                                    <i className="bi bi-bank me-1"></i> Thông tin ngân hàng
                                                </div>
                                                <div><span className="text-muted">Ngân hàng:</span> {user.bankName}</div>
                                                <div><span className="text-muted">Tên thẻ:</span> {user.accountName}</div>
                                                <div><span className="text-muted">Số TK:</span> {user.bankAccount}</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Col>
                            <Col xs={12} sm={3} className="text-end mt-3 mt-sm-0">
                                {/* <div className="fw-bold text-danger" style={{ fontSize: 22 }}>0đ</div>
                                <div className="small text-muted">Tổng tích lũy</div> */}
                                <div className="d-flex justify-content-end gap-2 mt-2 flex-wrap">
                                    {editMode ? (
                                        <>
                                            <Button variant="outline-secondary" size="sm" onClick={handleCancel}>Hủy</Button>
                                            <Button variant="success" size="sm" onClick={handleSave}>Lưu</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>
                                                <i className="bi bi-pencil-square me-1"></i>Cập nhật
                                            </Button>
                                            <Button variant="outline-warning" size="sm" onClick={() => setShowPasswordModal(true)}>
                                                <i className="bi bi-shield-lock me-1"></i>Đổi mật khẩu
                                            </Button>
                                        </>
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
                                    {/* Detail Panels */}
                                    <Row className="g-3">
                                        {/* Đơn hàng gần nhất */}
                                        <Col md={6}>
                                            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%" }}>
                                                <div style={{
                                                    background: "linear-gradient(90deg, #d70018, #a8001a)",
                                                    padding: "14px 20px", display: "flex", alignItems: "center", gap: 8
                                                }}>
                                                    <i className="bi bi-bag-check-fill text-white" style={{ fontSize: 16 }}></i>
                                                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Đơn hàng gần nhất</span>
                                                </div>
                                                <div style={{ padding: "20px 20px 16px" }}>
                                                    {orders.length > 0 ? (
                                                        <>
                                                            <div className="d-flex align-items-start justify-content-between mb-2">
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 15, color: "#d70018" }}>
                                                                        #{orders[0]?.orderCode}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                        {new Date(orders[0]?.createdAt).toLocaleDateString("vi-VN")}
                                                                    </div>
                                                                </div>
                                                                <Badge bg="danger" style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20 }}>
                                                                    {orders[0]?.status}
                                                                </Badge>
                                                            </div>
                                                            <div style={{
                                                                background: "linear-gradient(135deg, #fff5f5, #ffe4e4)",
                                                                borderRadius: 10, padding: "10px 14px",
                                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                                marginBottom: 14
                                                            }}>
                                                                <span style={{ fontSize: 13, color: "#666" }}>Tổng tiền</span>
                                                                <span style={{ fontWeight: 700, fontSize: 16, color: "#d70018" }}>
                                                                    {formatCurrency(orders[0]?.total)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewOrder(orders[0]?.orderId)}
                                                                style={{
                                                                    width: "100%", border: "none", background: "transparent",
                                                                    color: "#d70018", fontWeight: 600, fontSize: 13, cursor: "pointer",
                                                                    padding: "8px", borderRadius: 8, transition: "background 0.2s"
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = "#fff0f0"}
                                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                            >
                                                                Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-3">
                                                            <i className="bi bi-bag-x text-muted" style={{ fontSize: 36, opacity: 0.4 }}></i>
                                                            <div style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>Chưa có đơn hàng nào</div>
                                                            <button
                                                                onClick={() => window.location.href = "/"}
                                                                style={{
                                                                    marginTop: 10, background: "linear-gradient(135deg,#d70018,#a8001a)",
                                                                    border: "none", color: "#fff", borderRadius: 8,
                                                                    padding: "7px 18px", fontSize: 13, cursor: "pointer"
                                                                }}
                                                            >
                                                                Mua sắm ngay
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Thu cũ gần nhất */}
                                        <Col md={6}>
                                            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%" }}>
                                                <div style={{
                                                    background: "linear-gradient(90deg, #e65c00, #c44b00)",
                                                    padding: "14px 20px", display: "flex", alignItems: "center", gap: 8
                                                }}>
                                                    <i className="bi bi-phone-fill text-white" style={{ fontSize: 16 }}></i>
                                                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Thu cũ gần nhất</span>
                                                </div>
                                                <div style={{ padding: "20px 20px 16px" }}>
                                                    {tradeIns.length > 0 ? (
                                                        <>
                                                            <div className="d-flex align-items-start justify-content-between mb-2">
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 15, color: "#e65c00" }}>
                                                                        Thiết bị #{tradeIns[0]?.productItemId ? tradeIns[0].productItemId.substring(0, 8) : 'N/A'}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                        {new Date(tradeIns[0]?.testDate).toLocaleDateString("vi-VN")}
                                                                    </div>
                                                                </div>
                                                                <Badge bg="warning" text="dark" style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20 }}>
                                                                    {tradeIns[0]?.overallAssessment}
                                                                </Badge>
                                                            </div>
                                                            <div style={{
                                                                background: "linear-gradient(135deg, #fff8f0, #ffe8d0)",
                                                                borderRadius: 10, padding: "10px 14px",
                                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                                marginBottom: 14
                                                            }}>
                                                                <span style={{ fontSize: 13, color: "#666" }}>Khấu hao</span>
                                                                <span style={{ fontWeight: 700, fontSize: 16, color: "#e65c00" }}>
                                                                    -{tradeIns[0]?.totalDepreciation}%
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewTradeIn(tradeIns[0]?.id)}
                                                                style={{
                                                                    width: "100%", border: "none", background: "transparent",
                                                                    color: "#e65c00", fontWeight: 600, fontSize: 13, cursor: "pointer",
                                                                    padding: "8px", borderRadius: 8, transition: "background 0.2s"
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = "#fff5ec"}
                                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                            >
                                                                Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-3">
                                                            <i className="bi bi-phone text-muted" style={{ fontSize: 36, opacity: 0.4 }}></i>
                                                            <div style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>Chưa có giao dịch thu cũ nào</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Địa chỉ mặc định */}
                                        <Col md={12}>
                                            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                                                <div style={{
                                                    background: "linear-gradient(90deg, #3a3a3a, #131814)",
                                                    padding: "14px 20px", display: "flex", alignItems: "center", gap: 8
                                                }}>
                                                    <i className="bi bi-geo-alt-fill text-white" style={{ fontSize: 16 }}></i>
                                                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Địa chỉ mặc định</span>
                                                </div>
                                                <div style={{ padding: "18px 20px" }}>
                                                    {addresses.find(a => a.isDefault) ? (() => {
                                                        const addr = addresses.find(a => a.isDefault);
                                                        return (
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div style={{
                                                                    width: 44, height: 44, borderRadius: "50%",
                                                                    background: "linear-gradient(135deg,#3a3a3a,#131814)",
                                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                                }}>
                                                                    <i className="bi bi-house-fill text-white" style={{ fontSize: 18 }}></i>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                                                                        {addr.fullName}
                                                                        <span style={{ fontWeight: 400, color: "#888", fontSize: 13, marginLeft: 8 }}>— {addr.phone}</span>
                                                                    </div>
                                                                    <div style={{ color: "#777", fontSize: 13, marginTop: 2 }}>
                                                                        <i className="bi bi-map me-1" style={{ color: "#d70018" }}></i>
                                                                        {addr.fullAddress || `${addr.addressLine}, ${addr.wardName}, ${addr.districtName}, ${addr.cityName}`}
                                                                    </div>
                                                                </div>
                                                                <Badge bg="danger" style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20, flexShrink: 0 }}>
                                                                    <i className="bi bi-check-circle me-1"></i>Mặc định
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })() : (
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div style={{
                                                                width: 44, height: 44, borderRadius: "50%", background: "#f1f1f1",
                                                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                            }}>
                                                                <i className="bi bi-geo text-muted" style={{ fontSize: 20 }}></i>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: "#555" }}>Chưa có địa chỉ mặc định</div>
                                                                <div style={{ fontSize: 13, color: "#aaa" }}>
                                                                    Vào <span
                                                                        style={{ color: "#d70018", cursor: "pointer", textDecoration: "underline" }}
                                                                        onClick={() => setActiveTab("address")}
                                                                    >Sổ địa chỉ</span> để thêm địa chỉ
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}


                            {
                                activeTab === "orders" && (
                                    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(215,0,24,0.10)" }}>
                                        {/* Header */}
                                        <div style={{
                                            background: "linear-gradient(135deg, #d70018 0%, #a8001a 100%)",
                                            padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "7px 10px" }}>
                                                    <i className="bi bi-bag-check-fill" style={{ fontSize: 18, color: "#fff" }}></i>
                                                </div>
                                                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Lịch sử đơn hàng</span>
                                            </div>
                                            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 13 }}>
                                                {orders.length} đơn
                                            </span>
                                        </div>
                                        {/* Body */}
                                        <div style={{ background: "#fff", padding: "8px 0" }}>
                                            {orders.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-bag-x" style={{ fontSize: 48, color: "#d70018", opacity: 0.3 }}></i>
                                                    <div style={{ color: "#aaa", fontSize: 14, marginTop: 12 }}>Bạn chưa có đơn hàng nào</div>
                                                    <button
                                                        onClick={() => window.location.href = "/"}
                                                        style={{
                                                            marginTop: 14, background: "linear-gradient(135deg, #d70018, #a8001a)",
                                                            border: "none", color: "#fff", borderRadius: 8,
                                                            padding: "8px 22px", fontSize: 14, cursor: "pointer", fontWeight: 600
                                                        }}
                                                    >Mua sắm ngay</button>
                                                </div>
                                            ) : (
                                                orders.map(order => (
                                                    <div
                                                        key={order.orderId}
                                                        onClick={() => handleViewOrder(order.orderId)}
                                                        style={{ cursor: "pointer", padding: "14px 24px", borderBottom: "1px solid #f3f3f3", transition: "background 0.15s" }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <div style={{
                                                                    width: 36, height: 36, borderRadius: "50%",
                                                                    background: "linear-gradient(135deg, #d70018, #a8001a)",
                                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                                }}>
                                                                    <i className="bi bi-receipt" style={{ color: "#fff", fontSize: 16 }}></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#d70018" }}>#{order.orderCode}</div>
                                                                    <div style={{ fontSize: 12, color: "#999" }}>
                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <div style={{ fontWeight: 700, color: "#d70018", fontSize: 15 }}>{formatCurrency(order.total)}</div>
                                                                <span style={{
                                                                    fontSize: 11, padding: "2px 10px", borderRadius: 20,
                                                                    background: "#fff0f0", color: "#d70018", fontWeight: 600
                                                                }}>{order.status}</span>
                                                            </div>
                                                        </div>
                                                        {order.shippingAddress && (
                                                            <div style={{ fontSize: 12, color: "#888", marginTop: 6, paddingLeft: 46 }}>
                                                                <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                                {order.shippingAddress.fullAddress}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === "trade-in" && (
                                    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(230,92,0,0.10)" }}>
                                        {/* Header */}
                                        <div style={{
                                            background: "linear-gradient(135deg, #e65c00 0%, #c44b00 100%)",
                                            padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "7px 10px" }}>
                                                    <i className="bi bi-phone-fill" style={{ fontSize: 18, color: "#fff" }}></i>
                                                </div>
                                                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Lịch sử Thu cũ đổi mới</span>
                                            </div>
                                            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 13 }}>
                                                {tradeIns.length} lần
                                            </span>
                                        </div>
                                        {/* Body */}
                                        <div style={{ background: "#fff", padding: "8px 0" }}>
                                            {tradeIns.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-phone" style={{ fontSize: 48, color: "#e65c00", opacity: 0.3 }}></i>
                                                    <div style={{ color: "#aaa", fontSize: 14, marginTop: 12 }}>Bạn chưa có giao dịch thu cũ nào</div>
                                                </div>
                                            ) : (
                                                tradeIns.map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleViewTradeIn(item.id)}
                                                        style={{ cursor: "pointer", padding: "14px 24px", borderBottom: "1px solid #f3f3f3", transition: "background 0.15s" }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#fff8f0"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <div style={{
                                                                    width: 36, height: 36, borderRadius: "50%",
                                                                    background: "linear-gradient(135deg, #e65c00, #c44b00)",
                                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                                }}>
                                                                    <i className="bi bi-arrow-repeat" style={{ color: "#fff", fontSize: 16 }}></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#c44b00" }}>
                                                                        Thiết bị #{item.productItemId ? item.productItemId.substring(0, 8) : 'N/A'}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#999" }}>
                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                        {new Date(item.testDate).toLocaleDateString("vi-VN")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <div style={{ fontWeight: 700, color: "#c44b00", fontSize: 15 }}>
                                                                    {item.estimatedRepairCost ? formatCurrency(item.estimatedRepairCost) : 'Đang cập nhật'}
                                                                </div>
                                                                <span style={{
                                                                    fontSize: 11, padding: "2px 10px", borderRadius: 20,
                                                                    background: "#fff3e0", color: "#e65c00", fontWeight: 600
                                                                }}>{item.overallAssessment}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginTop: 6, paddingLeft: 46, display: "flex", gap: 8, alignItems: "center" }}>
                                                            <span style={{ fontSize: 12, color: "#aaa" }}>Trạng thái:</span>
                                                            <span style={{
                                                                fontSize: 11, padding: "2px 10px", borderRadius: 20,
                                                                background: "#e3f2fd", color: "#0277bd", fontWeight: 600
                                                            }}>{item.status}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === "address" && (
                                    <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(58,58,58,0.12)" }}>
                                        {/* Header */}
                                        <div style={{
                                            background: "linear-gradient(135deg, #3a3a3a 0%, #131814 100%)",
                                            padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 10px" }}>
                                                    <i className="bi bi-geo-alt-fill" style={{ fontSize: 18, color: "#fff" }}></i>
                                                </div>
                                                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Sổ địa chỉ</span>
                                            </div>
                                            <button
                                                onClick={() => setShowAddressModal(true)}
                                                style={{
                                                    background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.35)",
                                                    color: "#fff", borderRadius: 20, padding: "5px 16px",
                                                    fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 5
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                                            >
                                                <i className="bi bi-plus-lg"></i> Thêm mới
                                            </button>
                                        </div>
                                        {/* Body */}
                                        <div style={{ background: "#fff", padding: "8px 0" }}>
                                            {addresses.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-geo" style={{ fontSize: 48, color: "#3a3a3a", opacity: 0.25 }}></i>
                                                    <div style={{ color: "#aaa", fontSize: 14, marginTop: 12 }}>Bạn chưa lưu địa chỉ nào</div>
                                                    <button
                                                        onClick={() => setShowAddressModal(true)}
                                                        style={{
                                                            marginTop: 14, background: "linear-gradient(135deg, #3a3a3a, #131814)",
                                                            border: "none", color: "#fff", borderRadius: 8,
                                                            padding: "8px 22px", fontSize: 14, cursor: "pointer", fontWeight: 600
                                                        }}
                                                    >Thêm địa chỉ</button>
                                                </div>
                                            ) : (
                                                addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        style={{ padding: "16px 24px", borderBottom: "1px solid #f3f3f3" }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                                <div style={{
                                                                    width: 40, height: 40, borderRadius: "50%",
                                                                    background: addr.isDefault
                                                                        ? "linear-gradient(135deg, #3a3a3a, #131814)"
                                                                        : "#f1f5f9",
                                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                                                }}>
                                                                    <i className="bi bi-house-fill" style={{ color: addr.isDefault ? "#fff" : "#aaa", fontSize: 16 }}></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                                                                        {addr.fullName}
                                                                        <span style={{ fontWeight: 400, color: "#888", fontSize: 13, marginLeft: 6 }}>— {addr.phone}</span>
                                                                        {addr.isDefault && (
                                                                            <span style={{
                                                                                marginLeft: 8, fontSize: 11, padding: "2px 10px", borderRadius: 20,
                                                                                background: "#e8f5e9", color: "#2e7d32", fontWeight: 600
                                                                            }}>
                                                                                <i className="bi bi-check-circle me-1"></i>Mặc định
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
                                                                        <i className="bi bi-map me-1" style={{ color: "#555" }}></i>
                                                                        {addr.addressLine}, {addr.wardName}, {addr.districtName}, {addr.cityName}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
                                                                {!addr.isDefault && (
                                                                    <button
                                                                        onClick={() => handleSetDefaultAddress(addr.id)}
                                                                        style={{
                                                                            background: "transparent", border: "1.5px solid #3a3a3a",
                                                                            color: "#3a3a3a", borderRadius: 8, padding: "4px 12px",
                                                                            fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
                                                                        }}
                                                                        onMouseEnter={e => { e.currentTarget.style.background = "#3a3a3a"; e.currentTarget.style.color = "#fff"; }}
                                                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3a3a3a"; }}
                                                                    >Đặt mặc định</button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                                    style={{
                                                                        background: "transparent", border: "1.5px solid #d70018",
                                                                        color: "#d70018", borderRadius: 8, padding: "4px 12px",
                                                                        fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = "#d70018"; e.currentTarget.style.color = "#fff"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d70018"; }}
                                                                >Xóa</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                            }
                        </Col >
                    </Row >
                </Col >
            </Row >

            {/* Add Address Modal */}
            < Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg" >
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
            </Modal >



            {/* Order Detail Modal */}
            < Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" >
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
                                        <tr key={idx} className="align-middle">
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div style={{ width: 60, height: 60, flexShrink: 0, background: '#f8f9fa', borderRadius: 8, overflow: 'hidden' }}>
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.productName}
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark mb-1">
                                                            {item.productName} {item.productItemName ? `- ${item.productItemName}` : ''}
                                                        </div>
                                                        <div className="small text-muted d-flex gap-2">
                                                            <Badge bg="light" text="dark" className="border">{item.modelName || item.productModelName}</Badge>
                                                            <Badge bg="light" text="dark" className="border">{item.colorName}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
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
                    {selectedOrder?.status === 'pending' && (
                        <Button
                            variant="danger"
                            onClick={() => handleCancelOrder(selectedOrder.orderId)}
                            disabled={detailLoading}
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowOrderModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal >

            {/* Trade-In Detail Modal */}
            < Modal show={showTradeInModal} onHide={() => setShowTradeInModal(false)} size="xl" >
                <Modal.Header closeButton>
                    <Modal.Title>Kết quả thẩm định của máy cũ</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {detailLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : selectedTradeIn ? (
                        <Row className="gy-4">
                            <Col lg={4}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="bg-primary text-white">
                                        <h5 className="mb-0 text-start">Thông tin thiết bị</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="text-start mb-1"><strong>Thiết bị:</strong> #{selectedTradeIn.productItemId ? selectedTradeIn.productItemId.substring(0, 8) : 'N/A'}</p>
                                        <p className="text-start mb-2"><strong>Ngày kiểm tra:</strong> {new Date(selectedTradeIn.testDate).toLocaleDateString('vi-VN')}</p>
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
                                            <p className="small text-start mb-0">Giá trị còn lại thực: <strong>{(100 - selectedTradeIn.totalDepreciation).toFixed(2)}%</strong>.</p>
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

                            <Col lg={8}>
                                <Card className="shadow-sm border-0 h-100">
                                    <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h5 className="mb-0 text-start">Chi tiết các hạng mục khấu hao</h5>
                                        {selectedTradeIn.images && selectedTradeIn.images.length > 0 && (
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                {selectedTradeIn.images.map((img, idx) => (
                                                    <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                                                        <img src={img} alt={`img-${idx}`} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
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
                                                        <td colSpan="3" className="text-center text-success py-4 my-2">
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
                    ) : <p className="p-3 text-center">Không tìm thấy thông tin thẩm định</p>}
                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="secondary" onClick={() => setShowTradeInModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal >

            {/* Change Password Modal */}
            < Modal
                show={showPasswordModal}
                onHide={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    setShowOldPw(false); setShowNewPw(false); setShowConfirmPw(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title><i className="bi bi-shield-lock me-2 text-warning"></i>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleChangePassword}>
                    <Modal.Body>
                        {/* Mật khẩu hiện tại */}
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu hiện tại <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showOldPw ? "text" : "password"}
                                    value={passwordForm.oldPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowOldPw(v => !v)}
                                    tabIndex={-1}
                                >
                                    <i className={`bi ${showOldPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                        </Form.Group>

                        {/* Mật khẩu mới */}
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showNewPw ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowNewPw(v => !v)}
                                    tabIndex={-1}
                                >
                                    <i className={`bi ${showNewPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                        </Form.Group>

                        {/* Xác nhận mật khẩu mới */}
                        <Form.Group className="mb-2">
                            <Form.Label>Xác nhận mật khẩu mới <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showConfirmPw ? "text" : "password"}
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                    isInvalid={
                                        passwordForm.confirmPassword.length > 0 &&
                                        passwordForm.newPassword !== passwordForm.confirmPassword
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowConfirmPw(v => !v)}
                                    tabIndex={-1}
                                >
                                    <i className={`bi ${showConfirmPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                                <Form.Control.Feedback type="invalid">
                                    Mật khẩu xác nhận không khớp!
                                </Form.Control.Feedback>
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowPasswordModal(false);
                                setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="warning" type="submit" disabled={passwordLoading}>
                            {passwordLoading ? <><Spinner size="sm" className="me-1" />Đang xử lý...</> : <><i className="bi bi-check-lg me-1"></i>Xác nhận</>}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal >

            {/* Bank Info Modal */}
            <Modal
                show={showBankInfoModal}
                onHide={() => setShowBankInfoModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title><i className="bi bi-bank me-2 text-primary"></i>Thông tin hoàn tiền</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveBankInfo}>
                    <Modal.Body>
                        <div className="alert alert-info">
                            Để hoàn tất việc hủy đơn hàng thanh toán qua ngân hàng, vui lòng cung cấp thông tin tài khoản để chúng tôi tiến hành hoàn tiền.
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên ngân hàng <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={bankInfoForm.bankName}
                                onChange={e => setBankInfoForm({ ...bankInfoForm, bankName: e.target.value })}
                                placeholder="VD: Vietcombank, Techcombank..."
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên chủ tài khoản <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={bankInfoForm.accountName}
                                onChange={(e) => setBankInfoForm({ ...bankInfoForm, accountName: formatAccountName(e.target.value) })}
                                placeholder="VD: NGUYEN VAN A"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số tài khoản <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={bankInfoForm.bankAccount}
                                onChange={e => setBankInfoForm({ ...bankInfoForm, bankAccount: e.target.value })}
                                placeholder="Nhập số tài khoản"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowBankInfoModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={bankInfoLoading}>
                            {bankInfoLoading ? <><Spinner size="sm" className="me-1" />Đang lưu...</> : "Lưu & Tiếp tục"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container >
    );
}
