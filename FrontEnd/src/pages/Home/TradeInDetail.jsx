import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, ProgressBar } from "react-bootstrap";
import { toast } from "react-toastify";
import diagnosticService from "../../services/diagnosticService";
import { RoutePaths } from "../../routes/RoutePaths";

// Define diagnostic check items
const diagnosticChecks = [
    { key: "microphoneDamage", label: "Microphone (Mic)" },
    { key: "frontCameraDamage", label: "Camera trước" },
    { key: "rearCameraDamage", label: "Camera sau" },
    { key: "speakerDamage", label: "Loa (Speaker)" },
    { key: "buttonDamage", label: "Các nút cứng (Nguồn, Volume...)" },
    { key: "chargingPortDamage", label: "Cổng sạc" },
    { key: "wifiBluetoothIssue", label: "Kết nối (Wifi/Bluetooth)" },
];

export default function TradeInDetail() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get passed state from ProductDetail
    const { product, selectedModel, selectedColor } = location.state || {};

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [batteryHealth, setBatteryHealth] = useState(100);
    const [notes, setNotes] = useState("");

    // Functional checks state (true means damage/issue exists)
    const [functionalStatus, setFunctionalStatus] = useState(
        diagnosticChecks.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {})
    );

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.warning("Chỉ được tải lên tối đa 5 ảnh.");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewUrls];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleCheckChange = (key) => {
        setFunctionalStatus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // State cho loading và kết quả
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        if (images.length === 0) {
            toast.error("Vui lòng tải lên ít nhất 1 ảnh của thiết bị cũ.");
            return;
        }

        // Validate productItemId (thiết bị muốn đổi lấy)
        // Lưu ý: Backend cần productItemId để biết đang check cho sản phẩm nào (hoặc biến thể nào của dòng cũ)
        // Ở đây giả sử context là kiểm tra cho dòng máy cũ tương ứng trong kho (nếu có)
        // Hoặc nếu API chỉ cần lưu kết quả thì productItemId có thể là ID của sản phẩm MỚI mà khách muốn đổi?
        // Theo Code Backend: ProductDiagnostic.productItem -> Là liên kết đến bảng ProductItem.
        // Có thể hiểu là tạo ra một bản ghi diagnostic gắn với một ProductItem cụ thể.
        // Nếu đây là luồng khách bán máy cũ -> Cần tạo ProductItem mới trước? Hoặc gắn tạm vào một ProductItem "Unknown"?
        // Tạm thời lấy product.id nếu có, hoặc báo lỗi.

        const targetProductItemId = product?.id || location.state?.selectedModel?.id; // Cần ID của ProductItem (Model cụ thể)

        if (!targetProductItemId) {
            toast.error("Không tìm thấy thông tin sản phẩm cần định giá.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Chuẩn bị FormData
            const formData = new FormData();

            // Append files (Ảnh)
            images.forEach((file) => {
                formData.append("files", file);
            });

            // Append data (JSON diagnostic request)
            const diagnosticRequest = {
                productItemId: targetProductItemId,
                ...functionalStatus,
                batteryHealth: parseFloat(batteryHealth),
                additionalNotes: notes,
                // Staff ID có thể null nếu là khách tự check
            };

            // Backend yêu cầu @RequestPart("data") là JSON
            // Cần set Content-Type cho part này là application/json
            // Tuy nhiên với axios và Spring Boot, thường gửi string json là được,
            // hoặc blob với type application/json.
            const jsonBlob = new Blob([JSON.stringify(diagnosticRequest)], {
                type: 'application/json'
            });
            formData.append("data", jsonBlob);



            // ... inside TradeInDetail component ...

            // 2. Call API
            const data = await diagnosticService.analyzeDiagnostic(formData);

            console.log("Diagnostic Result:", data);
            setResult(data);
            toast.success("Thẩm định thành công!");

            // Navigate to result page with data
            navigate(RoutePaths.TRADEIN_RESULT, {
                state: {
                    result: data,
                    product: product,
                    selectedModel: selectedModel,
                    selectedColor: selectedColor
                }
            });

        } catch (error) {
            console.error(error);
            toast.error(typeof error === 'string' ? error : "Có lỗi xảy ra khi thẩm định.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!location.state) {
        return (
            <Container className="py-5">
                <div className="alert alert-warning">
                    Vui lòng chọn sản phẩm cần đổi từ trang danh sách.
                    <Button variant="link" onClick={() => navigate("/trade-in")}>Quay lại</Button>
                </div>
            </Container>
        );
    }

    // Helpers
    if (isLoading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center vh-100 position-fixed top-0 start-0 w-100 bg-white" style={{ zIndex: 1050 }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="text-primary">Đang phân tích tình trạng máy...</h4>
                <p className="text-muted text-center px-3">
                    Hệ thống AI đang quét hình ảnh để đánh giá trầy xước, nứt vỡ...<br />
                    Vui lòng đợi trong giây lát (có thể mất tới 1-2 phút).
                </p>
            </div>
        );
    }

    // Removed inline result rendering - handled by TradeInResult page

    if (result) {
        return (
            <Container className="py-5">
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-success text-white">
                        <h4 className="mb-0 text-center">Kết Quả Thẩm Định</h4>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-4">
                            <Col md={6}>
                                <h5 className="text-muted mb-3">Thông tin thiết bị</h5>
                                <p><strong>Model:</strong> {location.state?.selectedModel?.name || product?.name}</p>
                                <p><strong>Dung lượng pin:</strong> {batteryHealth}%</p>
                                <p><strong>Đánh giá tổng quan:</strong> <span className="fw-bold text-primary">{result.overallAssessment}</span></p>
                            </Col>
                            <Col md={6}>
                                <h5 className="text-muted mb-3">Chi tiết hư hỏng</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Màn hình (Nứt/Vỡ)
                                        <span className={`badge ${result.screenCracks > 0 ? 'bg-danger' : 'bg-success'}`}>{result.screenCracks > 0 ? 'Phát hiện lỗi' : 'Tốt'}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Trầy xước thân vỏ
                                        <span className={`badge ${result.scratches > 0 ? 'bg-warning' : 'bg-success'}`}>{result.scratches > 0 ? 'Có trầy xước' : 'Tốt'}</span>
                                    </li>
                                    {/* Add more fields as needed */}
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Khấu hao chức năng
                                        <span className="badge bg-secondary">-{result.functionalDepreciation || 0}%</span>
                                    </li>
                                </ul>
                            </Col>
                        </Row>

                        <div className="alert alert-info text-center">
                            <h3>Tổng Khấu Hao: {result.totalDepreciation}%</h3>
                            <p className="mb-0">Giá trị thu lại ước tính: <strong>Liên hệ cửa hàng</strong></p>
                        </div>

                        <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                            <Button variant="outline-primary" onClick={() => setResult(null)}>Thẩm định lại</Button>
                            <Button variant="danger" onClick={() => navigate("/cart")}>Tiếp tục đổi máy</Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4 text-center text-primary">Thẩm định thiết bị cũ</h2>

            <Row>
                <Col md={8} className="mx-auto">
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0">1. Thông tin thiết bị của bạn</h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Images Upload */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Hình ảnh thực tế (Mặt trước, mặt sau, cạnh bên...)</Form.Label>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="position-relative" style={{ width: 100, height: 100 }}>
                                            <img src={url} alt={`Preview ${idx}`} className="w-100 h-100 object-fit-cover rounded border" />
                                            <button
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle"
                                                style={{ width: 20, height: 20, transform: "translate(30%, -30%)" }}
                                                onClick={() => removeImage(idx)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <div className="position-relative" style={{ width: 100, height: 100 }}>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="position-absolute w-100 h-100 opacity-0 cursor-pointer"
                                            />
                                            <div className="w-100 h-100 border border-dashed rounded d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                                                <i className="bi bi-camera fs-3"></i>
                                                <small>Thêm ảnh</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Form.Text className="text-muted">Tối đa 5 ảnh. Ảnh rõ nét giúp định giá chính xác hơn.</Form.Text>
                            </Form.Group>

                            {/* Battery Health */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Dung lượng pin tối đa (%)</Form.Label>
                                <Row>
                                    <Col xs={4} md={3}>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={batteryHealth}
                                            onChange={(e) => setBatteryHealth(e.target.value)}
                                        />
                                    </Col>
                                    <Col className="d-flex align-items-center position-relative">
                                        <ProgressBar
                                            now={batteryHealth}
                                            variant={batteryHealth > 80 ? "success" : batteryHealth > 50 ? "warning" : "danger"}
                                            className="w-100"
                                            style={{ height: 10 }}
                                        />
                                        <input
                                            type="range"
                                            className="position-absolute w-100 h-100 start-0 top-0 opacity-0"
                                            style={{ cursor: "pointer", zIndex: 10 }}
                                            min="0"
                                            max="100"
                                            value={batteryHealth}
                                            onChange={(e) => setBatteryHealth(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>

                            {/* Functional Checks */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold mb-3">Tình trạng chức năng (Tích chọn nếu bị lỗi/hỏng)</Form.Label>
                                <Row>
                                    {diagnosticChecks.map((item) => (
                                        <Col md={6} key={item.key} className="mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                id={item.key}
                                                label={item.label}
                                                checked={functionalStatus[item.key]}
                                                onChange={() => handleCheckChange(item.key)}
                                                className="custom-checkbox"
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Form.Group>

                            {/* Additional Notes */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Ghi chú thêm</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Mô tả thêm về tình trạng máy (trầy xước, đã thay linh kiện...)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* Submit Actions */}
                    <div className="d-grid gap-2">
                        <Button variant="danger" size="lg" onClick={handleSubmit}>
                            Gửi yêu cầu định giá
                        </Button>
                        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
