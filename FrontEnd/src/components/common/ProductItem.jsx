import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../assets/css/home/Products/ProductItem.css";

export default function ProductItem({ product }) {
    return (
        <Card className="product-card">
            {product.badge && (
                <Badge
                    className={`product-badge badge-${product.badge.toLowerCase()}`}
                >
                    {product.badge}
                </Badge>
            )}
            <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-overlay">
                    <Button className="btn-quick-view" title="Xem nhanh">
                        <i className="bi bi-eye"></i>
                    </Button>
                    <Button className="btn-wishlist" title="Yêu thích">
                        <i className="bi bi-heart"></i>
                    </Button>
                </div>
            </div>
            <Card.Body>
                <div className="product-condition">
                    <i className="bi bi-star-fill"></i>
                    <span>Tình trạng: {product.condition}</span>
                </div>
                <h5 className="product-name">{product.name}</h5>
                <div className="product-price">
                    <span className="current-price">{product.price}₫</span>
                    {product.oldPrice && (
                        <span className="old-price">{product.oldPrice}₫</span>
                    )}
                </div>
                <div className="product-actions">
                    <Button className="btn-add-cart">
                        <i className="bi bi-cart-plus me-2"></i>
                        Thêm vào giỏ
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}

ProductItem.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        oldPrice: PropTypes.string,
        image: PropTypes.string.isRequired,
        condition: PropTypes.string.isRequired,
        badge: PropTypes.string,
    }).isRequired,
};