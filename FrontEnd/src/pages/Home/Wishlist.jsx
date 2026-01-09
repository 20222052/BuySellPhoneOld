import { Container, Card } from "react-bootstrap";
export default function Wishlist() {
    return (
        <Container className="py-4">
            <Card className="p-4 border-0 shadow-sm text-center">
                <h2 className="mb-3"><i className="bi bi-heart"></i> Danh sách yêu thích</h2>
                <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
            </Card>
        </Container>
    );
}
