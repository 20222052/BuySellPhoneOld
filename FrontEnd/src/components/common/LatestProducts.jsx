import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function LatestProducts({ products = [] }) {
    if (!products.length) return null;
    return (
        <Card className="mb-3 p-3 border-0 shadow-sm">
            <h5 className="fw-bold mb-3" style={{ textAlign: "left" }}>Sản phẩm mới nhất</h5>
            <Row>
                {products.map(p => (
                    <Col md={2} sm={4} xs={6} key={p.id} className="mb-3">
                        <Card className="h-100 border-0 shadow-sm">
                            <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <Card.Img variant="top" src={p.image} style={{ height: 100, objectFit: "cover", borderRadius: 8 }} />
                                <Card.Body style={{ textAlign: "left" }}>
                                    <div className="fw-bold" style={{ fontSize: "1rem" }}>{p.name}</div>
                                    <div className="text-danger fw-bold">{p.price}₫</div>
                                </Card.Body>
                            </Link>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );
}
