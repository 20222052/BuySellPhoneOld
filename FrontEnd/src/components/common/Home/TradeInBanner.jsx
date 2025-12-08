import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function TradeInBanner() {
    const benefits = [
        "Định giá miễn phí",
        "Thu mua giá cao",
        "Thanh toán ngay",
        "Tư vấn tận tình",
    ];

    return (
        <section className="tradein-banner">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6}>
                        <div className="tradein-content">
                            <h2>Thu Cũ Đổi Mới</h2>
                            <p>
                                Lên đời điện thoại mới với giá ưu đãi. Đánh giá miễn phí, thanh
                                toán nhanh chóng.
                            </p>
                            <ul className="tradein-benefits">
                                {benefits.map((benefit, index) => (
                                    <li key={index}>
                                        <i className="bi bi-check-circle-fill"></i> {benefit}
                                    </li>
                                ))}
                            </ul>
                            <Button as={Link} to="/tradein" className="btn-tradein">
                                <i className="bi bi-arrow-repeat me-2"></i>
                                Đánh Giá Ngay
                            </Button>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className="tradein-image">
                            <img
                                src="https://cdn.viettablet.com/images/companies/1/0-hinh-moi/may-cu-trao-tay-nhan-ngay-sieu-pham-vtl-2.gif?1594012459965"
                                alt="Trade-in"
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
