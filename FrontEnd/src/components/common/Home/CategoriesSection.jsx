import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function CategoriesSection({ categories }) {
    return (
        <section className="categories-section">
            <Container>
                <div className="section-header">
                    <h2 className="section-title">Danh Mục Sản Phẩm</h2>
                    <p className="section-subtitle">Chọn thương hiệu yêu thích của bạn</p>
                </div>
                <Row>
                    {categories.map((category, index) => (
                        <Col lg={2} md={4} sm={6} key={index} className="mb-4">
                            <Link
                                to={`/products/${category.name.toLowerCase()}`}
                                className="category-card"
                            >
                                <div
                                    className="category-icon"
                                    style={{
                                        background: `${category.color}15`,
                                        color: category.color,
                                    }}
                                >
                                    <i className={category.icon}></i>
                                </div>
                                <h5>{category.name}</h5>
                                <p>{category.count} sản phẩm</p>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

CategoriesSection.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            icon: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
            color: PropTypes.string.isRequired,
        })
    ).isRequired,
};
