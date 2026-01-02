import { Container, Card, Form, Button } from "react-bootstrap";
export default function Settings() {
    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm">
                <h2 className="mb-3 text-center"><i className="bi bi-gear"></i> Cài đặt tài khoản</h2>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nhận thông báo khuyến mãi</Form.Label>
                        <Form.Check type="switch" id="promo-switch" label="Bật/tắt" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Đổi mật khẩu</Form.Label>
                        <Form.Control type="password" placeholder="Mật khẩu mới" />
                    </Form.Group>
                    <Button variant="primary">Lưu thay đổi</Button>
                </Form>
            </Card>
        </Container>
    );
}
