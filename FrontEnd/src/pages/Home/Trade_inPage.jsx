
import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

const phoneModels = [
    { name: "iPhone 13 Pro Max", memories: ["128GB", "256GB", "512GB"], colors: ["Xanh", "Đen", "Trắng", "Vàng"] },
    { name: "Samsung Galaxy S23 Ultra", memories: ["256GB", "512GB"], colors: ["Đen", "Xanh", "Hồng"] },
    { name: "Xiaomi 13 Pro", memories: ["128GB", "256GB"], colors: ["Trắng", "Đen"] },
    // ... thêm model nếu muốn
];

export default function TradeInPage() {
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedMemory, setSelectedMemory] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
        setSelectedMemory("");
        setSelectedColor("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedModel || !selectedMemory || !selectedColor || !image) {
            setError("Vui lòng điền đầy đủ thông tin và tải ảnh sản phẩm.");
            return;
        }
        setError("");
        setSubmitted(true);
        // Gửi dữ liệu lên server tại đây nếu cần
    };

    const memories = selectedModel ? phoneModels.find(m => m.name === selectedModel)?.memories : [];
    const colors = selectedModel ? phoneModels.find(m => m.name === selectedModel)?.colors : [];

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={7} lg={6}>
                    <Card className="shadow-sm p-4">
                        <h2 className="mb-4 text-center">Đăng ký Thu Cũ Đổi Mới</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {submitted && !error && (
                            <Alert variant="success">Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.</Alert>
                        )}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên điện thoại</Form.Label>
                                <Form.Select value={selectedModel} onChange={handleModelChange} required>
                                    <option value="">Chọn model...</option>
                                    {phoneModels.map((m) => (
                                        <option key={m.name} value={m.name}>{m.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phiên bản bộ nhớ</Form.Label>
                                <Form.Select value={selectedMemory} onChange={e => setSelectedMemory(e.target.value)} required disabled={!selectedModel}>
                                    <option value="">Chọn bộ nhớ...</option>
                                    {memories.map(mem => (
                                        <option key={mem} value={mem}>{mem}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Màu sắc sản phẩm</Form.Label>
                                <Form.Select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} required disabled={!selectedModel}>
                                    <option value="">Chọn màu...</option>
                                    {colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh sản phẩm</Form.Label>
                                <Form.Control type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} required />
                                {preview && (
                                    <div className="mt-2 text-center">
                                        <img src={preview} alt="preview" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: "1px solid #eee" }} />
                                    </div>
                                )}
                            </Form.Group>
                            <div className="d-grid mt-4">
                                <Button type="submit" variant="primary" size="lg">Gửi thông tin</Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
