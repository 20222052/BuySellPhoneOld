import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Table } from "react-bootstrap";
import { RoutePaths } from "../../routes/RoutePaths";

export default function TradeInResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, product, selectedModel } = location.state || {};

    if (!result) {
        return (
            <Container className="py-5 text-center">
                <div className="alert alert-warning">
                    Không tìm thấy kết quả thẩm định. Vui lòng thử lại.
                </div>
                <Button onClick={() => navigate(RoutePaths.TRADEIN_DETAIL)}>Quay lại</Button>
            </Container>
        );
    }

    // Weights mirroring the Python AI Service for display estimation
    const WEIGHTS = {
        screenCracks: 0.25, scratches: 0.15, edgeDings: 0.10,
        dents: 0.10, displayFailure: 0.20, deadPixels: 0.10, displayLines: 0.10
    };

    const FUNCTIONAL_PENALTIES = {
        microphoneDamage: 5, frontCameraDamage: 10, rearCameraDamage: 15,
        chargingPortDamage: 10, speakerDamage: 5, buttonDamage: 5,
        wifiBluetoothIssue: 15
    };

    // Helper to calculate estimated cosmetic deduction for display
    const getCosmeticDeduction = (key, score) => {
        const weight = WEIGHTS[key] || 0;
        return (score * weight).toFixed(1);
    };

    // Calculate functional deductions for display
    const functionalItems = Object.keys(FUNCTIONAL_PENALTIES).map(key => {
        if (result[key]) {
            return {
                label: getLabel(key),
                deduction: FUNCTIONAL_PENALTIES[key]
            };
        }
        return null;
    }).filter(item => item !== null);

    // Battery deduction
    let batteryDeduction = 0;
    if (result.batteryHealth < 80) {
        batteryDeduction = (80 - result.batteryHealth) * 0.5;
    }

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

    return (
        <Container className="py-5">
            <h2 className="text-center text-primary mb-4">Kết Quả Thẩm Định Chi Tiết</h2>

            <Row className="gy-4">
                {/* Cot trai: Thong tin may & Tong quan */}
                <Col lg={4}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0 text-start">Thông tin thiết bị</h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-start"><strong>Sản phẩm:</strong> {selectedModel?.name || product?.name || "Unknown Device"}</p>
                            <p className="text-start"><strong>Ngày kiểm tra:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                            <hr />
                            <div className="text-center">
                                <h6 className="text-start">Đánh giá tổng quan</h6>
                                <h3 className="text-primary fw-bold">{result.overallAssessment}</h3>
                            </div>
                            <hr />
                            <div className="text-center">
                                <h6 className="text-start">Tổng Khấu Hao</h6>
                                <h1 className="text-danger fw-bold">-{result.totalDepreciation}%</h1>
                                <p className="small text-start">Giá trị còn lại tính trên chức năng: <strong>{(100 - result.totalDepreciation).toFixed(2)}%</strong>.</p>
                            </div>
                            <hr />
                            {result.isContactStore || result.totalDepreciation >= 75 ? (
                                <div className="alert alert-danger mt-3 text-start">
                                    <strong>Lỗi thiết bị quá hạn mức khấu hao.</strong><br />
                                    Vui lòng <strong>Liên hệ cửa hàng</strong> để được tư vấn giá thu cụ thể.
                                </div>
                            ) : (
                                <div className="text-center mt-3 p-3 bg-light rounded border border-success">
                                    <h6 className="text-success mb-2">Khoảng giá dự kiến thu lại</h6>
                                    {result.minPredictedPrice && result.maxPredictedPrice ? (
                                        <h4 className="text-success fw-bold m-0">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.minPredictedPrice)}
                                            {' - '}
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.maxPredictedPrice)}
                                        </h4>
                                    ) : (
                                        <h5 className="text-muted m-0">Đang cập nhật...</h5>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Cot phai: Chi tiet khau hao */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 text-start">Chi tiết các hạng mục khấu hao</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table striped hover responsive className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Hạng mục</th>
                                        <th>Tình trạng / Mức độ</th>
                                        <th className="text-end">Khấu hao ước tính (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 1. Cosmetic Items */}
                                    {Object.keys(WEIGHTS).map(key => {
                                        const score = result[key] || 0;
                                        if (score > 0) {
                                            const deduction = getCosmeticDeduction(key, score);
                                            return (
                                                <tr key={key}>
                                                    <td>{getLabel(key)}</td>
                                                    <td>
                                                        <Badge bg={score > 50 ? 'danger' : 'warning'}>
                                                            {score > 50 ? 'Nặng' : 'Nhẹ'} (Score: {score})
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end text-danger fw-bold">-{deduction}%</td>
                                                </tr>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* 2. Functional Items */}
                                    {functionalItems.map((item, idx) => (
                                        <tr key={`func-${idx}`}>
                                            <td>{item.label}</td>
                                            <td><Badge bg="danger">Hỏng / Lỗi</Badge></td>
                                            <td className="text-end text-danger fw-bold">-{item.deduction}%</td>
                                        </tr>
                                    ))}

                                    {/* 3. Battery */}
                                    {batteryDeduction > 0 && (
                                        <tr>
                                            <td>{getLabel('battery')}</td>
                                            <td>Pin: {result.batteryHealth}%</td>
                                            <td className="text-end text-danger fw-bold">-{batteryDeduction.toFixed(1)}%</td>
                                        </tr>
                                    )}

                                    {/* No issues row */}
                                    {result.totalDepreciation === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center text-success py-3">
                                                <i className="bi bi-check-circle-fill me-2"></i>
                                                Thiết bị hoạt động hoàn hảo, không có lỗi lầm!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="fw-bold bg-light">
                                    <tr>
                                        <td colSpan="2" className="text-start">TỔNG CỘNG</td>
                                        <td className="text-end text-danger">-{result.totalDepreciation}%</td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                        <Card.Footer className="bg-white p-3">
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="outline-secondary" onClick={() => navigate(RoutePaths.TRADEIN)}>
                                    <i className="bi bi-arrow-counterclockwise me-2"></i>Thẩm định lại
                                </Button>
                                <Button variant="danger" size="lg" onClick={() => navigate(RoutePaths.TRADEIN)}>
                                    <i className="bi bi-cart-check me-2"></i>Tiếp tục đổi máy
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
