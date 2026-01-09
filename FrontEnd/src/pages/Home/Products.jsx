
import { useState } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import "../../assets/css/home/Products/PaginationCustom.css";
import ProductItem from "../../components/common/ProductItem";
import PaginationCustom from "../../components/common/PaginationCustom";
import "../../assets/css/home/Products/ProductItem.css";

// Dữ liệu mẫu, có thể thay bằng API
const allProducts = [
    {
        id: 1,
        name: "iPhone 13 Pro Max",
        price: "18.990.000",
        oldPrice: "25.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Hot",
        brand: "iPhone",
    },
    {
        id: 2,
        name: "Samsung Galaxy S23 Ultra",
        price: "16.990.000",
        oldPrice: "22.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/249948/samsung-galaxy-s23-ultra-green-thumbnew-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "Samsung",
    },
    {
        id: 3,
        name: "iPhone 14 Pro",
        price: "22.990.000",
        oldPrice: "28.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "New",
        brand: "iPhone",
    },
    {
        id: 4,
        name: "Xiaomi 13 Pro",
        price: "12.990.000",
        oldPrice: "16.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Hot",
        brand: "Xiaomi",
    },
    {
        id: 5,
        name: "OPPO Find X5 Pro",
        price: "14.990.000",
        oldPrice: "19.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "OPPO",
    },
    {
        id: 6,
        name: "Vivo V27 Pro",
        price: "9.990.000",
        oldPrice: "12.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "New",
        brand: "Vivo",
    },
    {
        id: 7,
        name: "Samsung Galaxy Z Fold 4",
        price: "24.990.000",
        oldPrice: "32.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "B",
        badge: "Hot",
        brand: "Samsung",
    },
    {
        id: 8,
        name: "iPhone 12 Pro Max",
        price: "15.990.000",
        oldPrice: "20.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "iPhone",
    },
    {
        id: 9,
        name: "iPhone 13 Pro Max",
        price: "18.990.000",
        oldPrice: "25.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Hot",
        brand: "iPhone",
    },
    {
        id: 10,
        name: "Samsung Galaxy S23 Ultra",
        price: "16.990.000",
        oldPrice: "22.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/249948/samsung-galaxy-s23-ultra-green-thumbnew-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "Samsung",
    },
    {
        id: 11,
        name: "iPhone 14 Pro",
        price: "22.990.000",
        oldPrice: "28.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "New",
        brand: "iPhone",
    },
    {
        id: 12,
        name: "Xiaomi 13 Pro",
        price: "12.990.000",
        oldPrice: "16.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Hot",
        brand: "Xiaomi",
    },
    {
        id: 13,
        name: "OPPO Find X5 Pro",
        price: "14.990.000",
        oldPrice: "19.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "OPPO",
    },
    {
        id: 14,
        name: "Vivo V27 Pro",
        price: "9.990.000",
        oldPrice: "12.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "New",
        brand: "Vivo",
    },
    {
        id: 15,
        name: "Samsung Galaxy Z Fold 4",
        price: "24.990.000",
        oldPrice: "32.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "B",
        badge: "Hot",
        brand: "Samsung",
    },
    {
        id: 16,
        name: "iPhone 12 Pro Max",
        price: "15.990.000",
        oldPrice: "20.990.000",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        condition: "A",
        badge: "Sale",
        brand: "iPhone",
    },
    // ... thêm sản phẩm nếu muốn test phân trang
];

const brands = ["iPhone", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme"];
const conditions = ["A", "B"];
const priceRanges = [
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10 - 15 triệu", min: 10000000, max: 15000000 },
    { label: "15 - 20 triệu", min: 15000000, max: 20000000 },
    { label: "Trên 20 triệu", min: 20000000, max: Infinity },
];

function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/\D/g, ""), 10);
}

export default function Products() {
    // State lọc
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("");
    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // Lọc sản phẩm
    let filtered = allProducts.filter((p) => {
        let ok = true;
        if (selectedBrand) ok = ok && p.brand === selectedBrand;
        if (selectedCondition) ok = ok && p.condition === selectedCondition;
        if (selectedPrice) {
            const range = priceRanges.find((r) => r.label === selectedPrice);
            if (range) {
                const price = parsePrice(p.price);
                ok = ok && price >= range.min && price < range.max;
            }
        }
        return ok;
    });

    // Phân trang
    const totalPages = Math.ceil(filtered.length / productsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Đổi trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Reset phân trang khi filter
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <Container className="products-page py-4">
            <h2 className="mb-4">Tất cả sản phẩm</h2>
            <Row className="mb-3">
                <Col md={3} sm={6} className="mb-2">
                    <Form.Select value={selectedBrand} onChange={handleFilterChange(setSelectedBrand)}>
                        <option value="">Tất cả hãng</option>
                        {brands.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Form.Select value={selectedCondition} onChange={handleFilterChange(setSelectedCondition)}>
                        <option value="">Tất cả tình trạng</option>
                        {conditions.map((c) => (
                            <option key={c} value={c}>Tình trạng {c}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Form.Select value={selectedPrice} onChange={handleFilterChange(setSelectedPrice)}>
                        <option value="">Tất cả mức giá</option>
                        {priceRanges.map((r) => (
                            <option key={r.label} value={r.label}>{r.label}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3} sm={6} className="mb-2">
                    <Button variant="secondary" onClick={() => {
                        setSelectedBrand("");
                        setSelectedCondition("");
                        setSelectedPrice("");
                        setCurrentPage(1);
                    }}>Xóa bộ lọc</Button>
                </Col>
            </Row>
            <Row>
                {paginated.length === 0 ? (
                    <Col><p>Không tìm thấy sản phẩm phù hợp.</p></Col>
                ) : (
                    paginated.map((product) => (
                        <Col lg={3} md={4} sm={6} xs={12} key={product.id} className="mb-4">
                            <ProductItem product={product} />
                        </Col>
                    ))
                )}
            </Row>
            <PaginationCustom
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </Container>
    );
}
