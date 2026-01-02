import { useState } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Badge, Image, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";

const user = {
    name: "Nguyễn Thanh Tùng",
    phone: "0977xxxxxx",
    email: "ngtung2004@gmail.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    memberType: "S-Student",
    memberSince: "01/01/2026",
    totalPoints: 1090000,
    orders: [
        {
            id: "#WB0301955345",
            date: "25/06/2024",
            name: "THANH RAM KINGSTON SODIMM 1.2V 16GB 3200MHZ CL22 (SN)",
            price: 1600000,
            status: "Đã nhận hàng",
            vat: true,
        },
        {
            id: "#SP.3060C.22.11.001025",
            date: "12/11/2024",
            name: "LAPTOP HP PAVILION 15-E0055TX 4G8M03P5-1135G7/8GB/512GB PCIe/15.6 FHD/VGA",
            price: 18900000,
            status: "Đã nhận hàng",
            vat: false,
        },
        {
            id: "#DH.283HTM.22.11.000862",
            date: "11/11/2022",
            name: "LAPTOP DELL VOSTRO 3510 P1F2002BL i5-1135G7/8GB/512GB PCIe/VGA 2GB/15.6 FHD/WIN11/ĐEN",
            price: 17900000,
            status: "Đã nhận hàng",
            vat: false,
        },
    ],
};

const sidebar = [
    { icon: "bi bi-house-door", label: "Tổng quan" },
    { icon: "bi bi-clock-history", label: "Lịch sử mua hàng" },
    { icon: "bi bi-person-lines-fill", label: "Thông tin tài khoản" },
    { icon: "bi bi-shield-check", label: "Chính sách bảo hành" },
    { icon: "bi bi-chat-dots", label: "Góp ý - Phản hồi - Hỗ trợ" },
    { icon: "bi bi-file-earmark-text", label: "Điều khoản sử dụng" },
    { icon: "bi bi-box-arrow-right", label: "Đăng xuất" },
];


export default function Profile() {
    const [activeSidebar, setActiveSidebar] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({ name: user.name, phone: user.phone, email: user.email });


    return (
        <Container fluid className="py-4" style={{ background: "#f7f8fa", minHeight: "100vh" }}>
            <Row className="justify-content-center">
                <Col md={3} lg={2} className="mb-3">
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
                                            (activeSidebar === idx ? "fw-bold text-danger bg-light" : "") + " d-flex align-items-center"
                                        }
                                        style={{ border: "none", background: "none", fontSize: 16, cursor: "pointer", borderRadius: 8, marginBottom: 2 }}
                                        onClick={() => setActiveSidebar(idx)}
                                    >
                                        <i className={item.icon + " me-2"}></i>
                                        <span className="d-none d-md-inline">{item.label}</span>
                                    </ListGroup.Item>
                                </OverlayTrigger>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
                <Col md={9} lg={7}>
                    {/* Header user info */}
                    <Card className="border-0 shadow-sm mb-3 p-3">
                        <Row className="align-items-center">
                            <Col xs={2} className="d-flex justify-content-center align-items-center">
                                <Image src={user.avatar} roundedCircle width={60} height={60} alt="avatar" />
                            </Col>
                            <Col xs={7} className="ps-3">
                                {editMode ? (
                                    <>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            value={profile.name}
                                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                                            placeholder="Họ tên"
                                        />
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="Số điện thoại"
                                        />
                                        <input
                                            type="email"
                                            className="form-control mb-2"
                                            value={profile.email}
                                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                                            placeholder="Email"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="fw-bold" style={{ fontSize: 20 }}>{profile.name}</div>
                                        <div className="text-muted small">{profile.phone} <Badge bg="success">S-Student</Badge></div>
                                        <div className="small">Thành viên từ: {user.memberSince}</div>
                                        <div className="small text-muted">{profile.email}</div>
                                    </>
                                )}
                            </Col>
                            <Col xs={3} className="text-end">
                                <div className="fw-bold text-danger" style={{ fontSize: 22 }}>{user.totalPoints.toLocaleString()}đ</div>
                                <div className="small text-muted">Tổng tích lũy</div>
                                <Button
                                    variant={editMode ? "success" : "outline-primary"}
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? "Lưu" : "Cập nhật"}
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tab menu */}
                    <Nav variant="tabs" className="mb-3">
                        <Nav.Item><Nav.Link active>Tổng quan</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link>Lịch sử mua hàng</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link>Ưu đãi</Nav.Link></Nav.Item>
                    </Nav>

                    <Row>
                        <Col md={8}>
                            {/* Đơn hàng gần đây */}
                            <Card className="border-0 shadow-sm mb-3 p-3">
                                <div className="fw-bold mb-2">Đơn hàng gần đây</div>
                                {user.orders.length === 0 ? (
                                    <div className="text-muted">Bạn chưa có đơn hàng nào.</div>
                                ) : (
                                    user.orders.map(order => (
                                        <div key={order.id} className="mb-3 pb-2 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div>
                                                    <span className="fw-bold">{order.id}</span> <span className="text-muted small">{order.date}</span>
                                                </div>
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Xem chi tiết đơn hàng</Tooltip>}
                                                >
                                                    <Button size="sm" variant="outline-primary">Chi tiết</Button>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="small text-muted mb-1" style={{ textAlign: "left" }}>{order.name}</div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="text-danger fw-bold">{order.price.toLocaleString()}đ</div>
                                                <span className="badge bg-success">{order.status}</span>
                                                {order.vat && <span className="badge bg-info">VAT</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </Card>

                            {/* Sản phẩm yêu thích */}
                            <Card className="border-0 shadow-sm mb-3 p-3">
                                <div className="fw-bold mb-2">Sản phẩm yêu thích</div>
                                <div className="d-flex align-items-center mb-2">
                                    <Image src="https://cdn.cellphones.com.vn/media/wysiwyg/CP_Icon/CP_Icon_Heart.png" width={60} alt="favorite" />
                                    <div className="text-muted ms-3">Bạn chưa có sản phẩm yêu thích nào.</div>
                                </div>
                                <Button variant="danger">Khám phá sản phẩm</Button>
                            </Card>
                        </Col>
                        <Col md={4}>
                            {/* Ưu đãi của bạn */}
                            <Card className="border-0 shadow-sm mb-3 p-3">
                                <div className="fw-bold mb-2">Ưu đãi của bạn</div>
                                <div className="d-flex align-items-center mb-2">
                                    <Image src="https://cdn.cellphones.com.vn/media/wysiwyg/CP_Icon/CP_Icon_Gift.png" width={60} alt="gift" />
                                    <div className="text-muted ms-3">Bạn chưa có ưu đãi nào.</div>
                                </div>
                                <Button variant="outline-danger">Xem ưu đãi</Button>
                            </Card>

                            {/* Banner chương trình */}
                            <Card className="border-0 shadow-sm mb-3 p-3">
                                <div className="fw-bold mb-2">Chương trình nổi bật</div>
                                <Row>
                                    <Col xs={6} className="mb-2">
                                        <Image src="https://cdn.cellphones.com.vn/media/wysiwyg/CP_Icon/banner1.png" fluid rounded alt="banner1" />
                                    </Col>
                                    <Col xs={6} className="mb-2">
                                        <Image src="https://cdn.cellphones.com.vn/media/wysiwyg/CP_Icon/banner2.png" fluid rounded alt="banner2" />
                                    </Col>
                                </Row>
                                <Image src="https://cdn.cellphones.com.vn/media/wysiwyg/CP_Icon/banner3.png" fluid rounded className="mb-2" alt="banner3" />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}
