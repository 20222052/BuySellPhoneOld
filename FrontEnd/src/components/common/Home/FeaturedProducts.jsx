import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProductItem from "../ProductItem";

export default function FeaturedProducts({ products }) {
    return (
        <section className="products-section">
            <Container>
                <div className="section-header">
                    <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
                    <p className="section-subtitle">Những sản phẩm được yêu thích nhất</p>
                </div>
                <Row>
                    {products.map((product) => (
                        <Col lg={3} md={6} key={product.id} className="mb-4">
                            <ProductItem product={product} />
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-4">
                    <Button as={Link} to="/products" className="btn-view-all">
                        Xem Tất Cả Sản Phẩm
                        <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                </div>
            </Container>
        </section>
    );
}

FeaturedProducts.propTypes = {
    products: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.string.isRequired,
            oldPrice: PropTypes.string,
            image: PropTypes.string.isRequired,
            condition: PropTypes.string.isRequired,
            badge: PropTypes.string,
        })
    ).isRequired,
};
