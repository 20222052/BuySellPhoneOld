import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function CategoriesSection({ brands }) {
    return (
        <section className="categories-section">
            <Container>
                <div className="section-header">
                    <h2 className="section-title">Thương Hiệu Nổi Bật</h2>
                    <p className="section-subtitle">Chọn thương hiệu yêu thích của bạn</p>
                </div>
                <Row>
                    {brands.map((brand) => (
                        <Col lg={2} md={4} sm={6} key={brand.id} className="mb-4">
                            <Link
                                to={`/products?brand=${brand.id}`}
                                className="category-card"
                            >
                                <div className="category-icon brand-logo">
                                    {brand.logoUrl ? (
                                        <img
                                            src={brand.logoUrl}
                                            alt={brand.name}
                                            className="brand-logo-img"
                                        />
                                    ) : (
                                        <i className="bi-phone"></i>
                                    )}
                                </div>
                                <h5>{brand.name}</h5>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

CategoriesSection.propTypes = {
    brands: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            logoUrl: PropTypes.string,
        })
    ),
};

CategoriesSection.defaultProps = {
    brands: [],
};
