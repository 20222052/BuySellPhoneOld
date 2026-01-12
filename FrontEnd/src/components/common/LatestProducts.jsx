import { Card, Row, Col } from "react-bootstrap";
import ProductItem from "./ProductItem";

export default function LatestProducts({ products = [] }) {
    if (!products.length) return null;
    return (
        <Card className="mb-3 p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3" style={{ textAlign: "left" }}>Sản phẩm mới nhất</h5>
            <Row>
                {products.slice(0, 4).map((product) => (
                    <Col md={3} sm={6} xs={12} key={product.id} className="mb-3">
                        <ProductItem product={product} />
                    </Col>
                ))}
            </Row>
        </Card>
    );
}
