import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Image, Spinner, Badge } from "react-bootstrap";
import UserService from "../../../services/userService";
import { toast } from "react-toastify";
import api from "../../../services/apiClient";

export default function AdminProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        avatarUrl: ""
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchUserInfo();
    }, []);

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
            console.error("Failed to fetch admin info:", error);
            toast.error("Không thể tải thông tin tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

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
            toast.error("Tải ảnh thất bại.");
        } finally {
            setUploading(false);
        }
    };

    const handleImageClick = () => {
        if (editMode && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                fullName: formData.fullName,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl
            };

            const response = await UserService.update(user.id, updatePayload);

            if (response && response.data) {
                setUser(response.data);
                // Update local storage if needed to keep header sync
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...response.data }));

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
        setFormData({
            fullName: user.fullName || "",
            phone: user.phone || "",
            email: user.email || "",
            avatarUrl: user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center mt-5">Không tìm thấy thông tin tài khoản.</div>;
    }

    return (
        <Container fluid className="p-4">
            <h4 className="mb-4">Thông tin tài khoản</h4>
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="border-0 shadow-sm text-center p-4 h-100">
                        <div className="mx-auto mb-3 position-relative" style={{ width: 150, height: 150 }}>
                            <Image
                                src={formData.avatarUrl}
                                roundedCircle
                                className="w-100 h-100 object-fit-cover border"
                                style={{ opacity: uploading ? 0.5 : 1, cursor: editMode ? 'pointer' : 'default' }}
                                onClick={handleImageClick}
                            />
                            {editMode && (
                                <div
                                    className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow p-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleImageClick}
                                >
                                    <i className="bi bi-camera-fill text-dark"></i>
                                </div>
                            )}
                            {uploading && (
                                <div className="position-absolute top-50 start-50 translate-middle">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="d-none"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h5 className="fw-bold">{user.fullName}</h5>
                        <div className="text-muted mb-2">{user.email}</div>
                        <div>
                            {user.roles?.map((role, idx) => (
                                <Badge key={idx} bg="primary" className="me-1">{role.name}</Badge>
                            ))}
                        </div>
                        <div className="mt-3 small text-muted">
                            Tham gia từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Chi tiết hồ sơ</h5>
                            {!editMode && (
                                <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>
                                    <i className="bi bi-pencil me-1"></i> Chỉnh sửa
                                </Button>
                            )}
                        </div>

                        <Form>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            disabled={!editMode}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!editMode}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={formData.email}
                                            disabled={true}
                                            title="Không thể thay đổi email"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trạng thái</Form.Label>
                                        <div>
                                            <Badge bg={user.status === 'active' ? 'success' : 'danger'}>
                                                {user.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
                                            </Badge>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {editMode && (
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Button variant="secondary" onClick={handleCancel}>Hủy bỏ</Button>
                                    <Button variant="success" onClick={handleSave}>Lưu thay đổi</Button>
                                </div>
                            )}
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
