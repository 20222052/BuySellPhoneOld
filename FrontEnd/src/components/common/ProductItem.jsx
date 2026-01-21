import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../assets/css/home/Products/ProductItem.css";

export default function ProductItem({ product }) {
    // Format giá tiền
    const formatPrice = (price) => {
        if (!price) return "0";
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Get product status with priority: stock first, then ProductItem status
    const getProductStatus = () => {
        // Priority 1: Check total stock quantity
        const totalStock = product.qtyAvailable || 0;

        if (totalStock === 0) {
            return { label: 'Hết hàng', className: 'badge-out-of-stock' };
        }

        // Priority 2: Check ProductItem status (assuming status field exists)
        // Status mapping: 0=inactive, 1=active, 2=discontinued
        if (product.status === 0) {
            return { label: 'Ngừng bán', className: 'badge-inactive' };
        }
        if (product.status === 2) {
            return { label: 'Ngừng SX', className: 'badge-discontinued' };
        }

        // Default: Product is active and in stock
        return null; // No badge needed for normal items
    };

    const statusBadge = getProductStatus();

    return (
        <Card className="product-card">
            <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                {/* Discount Badge */}
                {product.discountPercent && product.discountPercent > 0 && (
                    <Badge className="product-badge badge-sale">
                        -{product.discountPercent}%
                    </Badge>
                )}

                {/* Status Badge (stock/inactive/discontinued) */}
                {statusBadge && (
                    <Badge className={`product-badge-status ${statusBadge.className}`}>
                        {statusBadge.label}
                    </Badge>
                )}

                <div className="product-image">
                    <img
                        src={product.primaryImageUrl || "https://via.placeholder.com/300x300?text=No+Image"}
                        alt={product.name || product.productName}
                    />
                    <div className="product-overlay">
                        <Button className="btn-quick-view" title="Xem nhanh">
                            <i className="bi bi-eye"></i>
                        </Button>
                    </div>
                </div>
            </Link>
            <Card.Body>
                <div className="product-condition">
                    <i className="bi bi-star-fill"></i>
                    <span>
                        {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                        {product.totalRatings ? ` (${product.totalRatings})` : ""}
                    </span>
                </div>
                {/* <div className="product-brand">
                    <small className="text-muted">{product.brandName}</small>
                </div> */}
                <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                    <h5 className="product-name">{product.productName} - {product.name}</h5>
                </Link>

                <div className="product-price">
                    <span className="current-price">{formatPrice(product.sellPrice)}₫</span>
                    {product.comparePrice && product.comparePrice > product.sellPrice && (
                        <span className="old-price">{formatPrice(product.comparePrice)}₫</span>
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
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        productId: PropTypes.string,
        productName: PropTypes.string.isRequired,
        productDescription: PropTypes.string,
        productStatus: PropTypes.string,
        brandId: PropTypes.string,
        brandName: PropTypes.string,
        brandLogoUrl: PropTypes.string,
        categoryId: PropTypes.string,
        categoryName: PropTypes.string,
        basePrice: PropTypes.number,
        sellPrice: PropTypes.number.isRequired,
        comparePrice: PropTypes.number,
        discountPercent: PropTypes.number,
        primaryImageUrl: PropTypes.string,
        primaryImagePublicId: PropTypes.string,
        averageRating: PropTypes.number,
        totalRatings: PropTypes.number,
        modelCount: PropTypes.number,
        colorCount: PropTypes.number,
        qtyAvailable: PropTypes.number,
        warrantyMonths: PropTypes.number,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
    }).isRequired,
};