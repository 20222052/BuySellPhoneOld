import { Container, Card } from "react-bootstrap";
export default function About() {
    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm text-center">
                <h2 className="mb-3"><i className="bi bi-info-circle"></i> Giới thiệu</h2>
                <p>PhoneZin là hệ thống mua bán điện thoại cũ uy tín, cam kết chất lượng và giá tốt nhất cho khách hàng.</p>
                <p>Chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm tiện lợi, an toàn và hài lòng nhất.</p>
            </Card>
        </Container>
    );
}
