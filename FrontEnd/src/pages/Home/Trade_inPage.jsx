
import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import "../../assets/css/home/Products/PaginationCustom.css";
import ProductTradein from "../../components/common/ProductTradein";
import PaginationCustom from "../../components/common/PaginationCustom";
import "../../assets/css/home/Products/ProductItem.css";
import ProductItemService from "../../services/productItemService";
import BrandService from "../../services/brandService";
import CategoryService from "../../services/categoryService";

const productStatuses = [
    { value: "active", label: "Đang bán" },
    { value: "inactive", label: "Ngừng bán" },
    { value: "discontinued", label: "Ngừng kinh doanh" },
];
const priceRanges = [
    { label: "Dưới 10 triệu", min: 0, max: 10000000 },
    { label: "10 - 15 triệu", min: 10000000, max: 15000000 },
    { label: "15 - 20 triệu", min: 15000000, max: 20000000 },
    { label: "Trên 20 triệu", min: 20000000, max: Infinity },
];

export default function TradeInPage() {
    // State lọc
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("createdAt-DESC");
    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // State dữ liệu
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState(null);

    // Load danh sách brands
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await BrandService.getAll({ pageSize: 100 });
                if (response && response.data) {
                    setBrands(response.data.items || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách hãng:", error);
            }
        };
        fetchBrands();
    }, []);

    // Load danh sách categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await CategoryService.getAll({ pageSize: 100 });
                if (response && response.data) {
                    setCategories(response.data.items || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Load danh sách sản phẩm Trade-in
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Tính toán minPrice và maxPrice từ selectedPrice
                let minPrice = "";
                let maxPrice = "";
                if (selectedPrice) {
                    const range = priceRanges.find((r) => r.label === selectedPrice);
                    if (range) {
                        minPrice = range.min;
                        maxPrice = range.max === Infinity ? "" : range.max;
                    }
                }

                // Parse sort option
                const [sortBy, sortDir] = sortOption.split("-");

                console.log("Fetching trade-in products with params:", {
                    search: searchQuery,
                    brandId: selectedBrand || "",
                    categoryId: selectedCategory || "",
                    status: selectedStatus || "",
                    minPrice,
                    maxPrice,
                    sortBy,
                    sortDir,
                    isTradeIn: 1, // Only trade-in products
                    page: currentPage - 1,
                    pageSize: productsPerPage
                });

                const response = await ProductItemService.getAllForList({
                    search: searchQuery,
                    brandId: selectedBrand || "",
                    categoryId: selectedCategory || "",
                    status: selectedStatus || "",
                    minPrice,
                    maxPrice,
                    sortBy: sortBy,
                    sortDir: sortDir,
                    isTradeIn: 1, // FORCE TRADE-IN FILTER
                    randomEnabled: false, // Usually list pages shouldn't be random on refresh/pagination
                    page: currentPage - 1,
                    pageSize: productsPerPage
                });

                if (response && response.data) {
                    setProducts(response.data.items || []);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                    setError(null);
                } else {
                    setProducts([]);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm trade-in:", error);
                setError(error.message || "Không thể kết nối đến server");
                setProducts([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedBrand, selectedCategory, selectedStatus, selectedPrice, searchQuery, sortOption, currentPage]);

    // Dữ liệu đã được filter và phân trang từ backend
    const paginated = products;

    // Đổi trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Helper function cho filter change
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1 text-primary">Sản phẩm Thu cũ Đổi mới</h2>
                    {totalElements > 0 && (
                        <p className="text-muted mb-0 text-start">
                            Tìm thấy <strong>{totalElements}</strong> sản phẩm hỗ trợ Trade-in
                        </p>
                    )}
                </div>
            </div>

            {/* Bộ lọc */}
            <Row className="mb-3">
                <Col lg={2} md={4} sm={6} className="mb-2">
                    <Form.Select value={selectedBrand} onChange={handleFilterChange(setSelectedBrand)}>
                        <option value="">Tất cả hãng</option>
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col lg={2} md={4} sm={6} className="mb-2">
                    <Form.Select value={selectedCategory} onChange={handleFilterChange(setSelectedCategory)}>
                        <option value="">Danh mục</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                {/* <Col lg={2} md={4} sm={6} className="mb-2">
                    <Form.Select value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)}>
                        <option value="">Trạng thái</option>
                        {productStatuses.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </Form.Select>
                </Col> */}
                <Col lg={2} md={4} sm={6} className="mb-2">
                    <Form.Select value={selectedPrice} onChange={handleFilterChange(setSelectedPrice)}>
                        <option value="">Mức giá</option>
                        {priceRanges.map((r) => (
                            <option key={r.label} value={r.label}>{r.label}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col lg={2} md={4} sm={6} className="mb-2">
                    <Form.Select
                        value={sortOption}
                        onChange={(e) => {
                            setSortOption(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="createdAt-DESC">Mới nhất</option>
                        <option value="createdAt-ASC">Cũ nhất</option>
                        <option value="sellPrice-ASC">Giá thấp → cao</option>
                        <option value="sellPrice-DESC">Giá cao → thấp</option>
                        <option value="productName-ASC">Tên A → Z</option>
                        <option value="productName-DESC">Tên Z → A</option>
                    </Form.Select>
                </Col>
                <Col lg={2} md={4} sm={6} className="mb-2">
                    <Button
                        variant="outline-secondary"
                        className="flex-grow-1"
                        onClick={() => {
                            setSelectedBrand("");
                            setSelectedCategory("");
                            setSelectedStatus("");
                            setSelectedPrice("");
                            setSearchQuery("");
                            setSortOption("createdAt-DESC");
                            setCurrentPage(1);
                        }}
                    >
                        Xóa bộ lọc
                    </Button>
                    {(selectedBrand || selectedCategory || selectedStatus || selectedPrice || searchQuery) && (
                        <Badge bg="primary" className="d-flex align-items-center px-3 ms-2">
                            {[selectedBrand, selectedCategory, selectedStatus, selectedPrice, searchQuery].filter(Boolean).length} bộ lọc
                        </Badge>
                    )}
                </Col>
            </Row>

            {/* Danh sách sản phẩm */}
            {
                loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        <h5>Lỗi khi tải sản phẩm</h5>
                        <p>{error}</p>
                    </div>
                ) : (
                    <Row>
                        {paginated.length === 0 ? (
                            <Col><div className="text-center py-5"><h5>Không tìm thấy sản phẩm Trade-in nào phù hợp.</h5></div></Col>
                        ) : (
                            paginated.map((product) => (
                                <Col lg={3} md={4} sm={6} xs={12} key={product.id} className="mb-4">
                                    <ProductTradein product={product} />
                                </Col>
                            ))
                        )}
                    </Row>
                )}

            {/* Phân trang */}
            {totalPages > 1 && (
                <PaginationCustom
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </Container>
    );
}
