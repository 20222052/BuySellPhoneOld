import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function HeroSection({ stats }) {
    return (
        <section className="hero-section">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6} className="hero-content">
                        <Badge bg="danger" className="hero-badge mb-3">
                            <i className="bi bi-lightning-fill me-2"></i>
                            Ưu đãi đặc biệt
                        </Badge>
                        <h1 className="hero-title">
                            Mua Bán Điện Thoại Cũ
                            <span className="highlight"> Uy Tín</span>
                        </h1>
                        <p className="hero-description">
                            Nền tảng mua bán điện thoại cũ hàng đầu Việt Nam. Sản phẩm chất
                            lượng, giá tốt, bảo hành chu đáo.
                        </p>
                        <div className="hero-buttons">
                            <Button as={Link} to="/products" className="btn-primary-custom" style={{ border: "1px solid #fff" }}>
                                <i className="bi bi-grid me-2"></i>
                                Xem Sản Phẩm
                            </Button>
                            <Button
                                as={Link}
                                to="/tradein"
                                variant="outline-light"
                                className="btn-outline-custom"
                            >
                                <i className="bi bi-arrow-repeat me-2"></i>
                                Thu Cũ Đổi Mới
                            </Button>
                        </div>
                        <div className="hero-stats">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-item">
                                    <h3>{stat.value}</h3>
                                    <p>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </Col>
                    <Col lg={6} className="hero-image">
                        <div className="phone-showcase">
                            <div className="phone-card">
                                <img
                                    src="https://cdn.tgdd.vn/Products/Images/42/342679/s16/iphone-17-pro-max-cam-thumb-650x650.png"
                                    alt="Phone"
                                />
                                <div className="floating-badge badge-1">
                                    <i className="bi bi-star-fill"></i>
                                    <span>Chất lượng cao</span>
                                </div>
                                <div className="floating-badge badge-2">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Bảo hành 12 tháng</span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}

HeroSection.propTypes = {
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
};
