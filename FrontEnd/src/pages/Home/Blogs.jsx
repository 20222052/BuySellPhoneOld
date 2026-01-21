import { useState, useEffect } from "react";
import { Row, Col, Card, Badge, Spinner, Alert, Form, InputGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PaginationCustom from "../../components/common/PaginationCustom";
import { Container } from "react-bootstrap";
import BlogService from "../../services/blogService";

const DEFAULT_PAGE_SIZE = 12;

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Fetch blogs từ API
    const fetchBlogs = async (page = 0, search = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await BlogService.getAll({
                page,
                pageSize: DEFAULT_PAGE_SIZE,
                search,
                sort: "DESC"
            });
            const data = response.data;
            setBlogs(data.items || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.page || 0);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách bài viết");
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(currentPage, searchText);
    }, [currentPage, searchText]);

    const handlePageChange = (page) => {
        setCurrentPage(page - 1); // API dùng 0-indexed
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchText(searchInput);
        setCurrentPage(0);
    };

    // Format date từ API
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Format view count
    const formatViews = (count) => {
        if (!count) return "0";
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + "K";
        }
        return count.toString();
    };

    // Lấy excerpt từ content
    const getExcerpt = (content, maxLength = 150) => {
        if (!content) return "";
        // Strip HTML tags
        const text = content.replace(/<[^>]*>/g, "");
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    // Bố cục: bài đầu là nổi bật, các bài còn lại chia 2 cột
    const featuredBlog = blogs[0];
    const otherBlogs = blogs.slice(1);

    return (
        <Container className="blogs-page py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2 className="mb-0">Tin tức & Đánh giá</h2>
                <Form onSubmit={handleSearch} style={{ minWidth: 280 }}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Tìm kiếm bài viết..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                            <i className="bi bi-search"></i>
                        </Button>
                    </InputGroup>
                </Form>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải bài viết...</p>
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <Button
                        variant="link"
                        onClick={() => fetchBlogs(currentPage, searchText)}
                        className="ms-2"
                    >
                        Thử lại
                    </Button>
                </Alert>
            )}

            {/* Empty state */}
            {!loading && !error && blogs.length === 0 && (
                <Alert variant="info" className="text-center">
                    <i className="bi bi-newspaper me-2"></i>
                    Chưa có bài viết nào.
                </Alert>
            )}

            {/* Blog content */}
            {!loading && !error && blogs.length > 0 && (
                <>
                    {/* Bài nổi bật */}
                    {featuredBlog && (
                        <Card className="mb-4 shadow-sm border-0" style={{ minHeight: 320, overflow: "hidden" }}>
                            <Row className="g-0">
                                <Col md={6} className="d-flex align-items-stretch">
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        minHeight: 320,
                                        overflow: "hidden",
                                        background: "#f8f9fa"
                                    }}>
                                        <img
                                            src={featuredBlog.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
                                            alt={featuredBlog.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex align-items-center">
                                    <Card.Body className="p-4">
                                        <Badge bg="primary" className="mb-2">Tin nổi bật</Badge>
                                        <div className="blog-meta mb-2" style={{ color: "#888" }}>
                                            <span>
                                                <i className="bi bi-calendar3 me-1"></i>
                                                {formatDate(featuredBlog.createdAt)}
                                            </span>
                                            <span className="ms-3">
                                                <i className="bi bi-eye me-1"></i>
                                                {formatViews(featuredBlog.viewCount)} lượt xem
                                            </span>
                                            {featuredBlog.author && (
                                                <span className="ms-3">
                                                    <i className="bi bi-person me-1"></i>
                                                    {featuredBlog.author}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="fw-bold mb-2">{featuredBlog.title}</h3>
                                        <p className="mb-3" style={{ fontSize: "1.1rem", color: "#555" }}>
                                            {getExcerpt(featuredBlog.content, 200)}
                                        </p>
                                        <Link
                                            to={`/blog/${featuredBlog.id}`}
                                            className="btn btn-outline-danger"
                                        >
                                            Đọc thêm <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Các bài còn lại chia 2 cột */}
                    <Row>
                        {otherBlogs.map((blog, index) => (
                            <Col md={6} key={blog.id || index} className="mb-4">
                                <Card className="h-100 shadow-sm border-0 blog-card" style={{ overflow: "hidden" }}>
                                    <Row className="g-0 h-100">
                                        <Col xs={5} className="d-flex align-items-stretch">
                                            <div style={{
                                                width: "100%",
                                                height: 180,
                                                overflow: "hidden",
                                                background: "#f8f9fa"
                                            }}>
                                                <img
                                                    src={blog.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                                                    alt={blog.title}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                        <Col xs={7} className="d-flex align-items-center">
                                            <Card.Body className="py-2 px-3">
                                                <div className="blog-meta mb-1" style={{ color: "#888", fontSize: "0.85rem" }}>
                                                    <span>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {formatDate(blog.createdAt)}
                                                    </span>
                                                    <span className="ms-2">
                                                        <i className="bi bi-eye me-1"></i>
                                                        {formatViews(blog.viewCount)}
                                                    </span>
                                                </div>
                                                <h5 className="fw-bold mb-1" style={{ fontSize: "1rem", lineHeight: 1.3 }}>
                                                    {blog.title}
                                                </h5>
                                                <p className="mb-2 text-muted" style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                                                    {getExcerpt(blog.content, 80)}
                                                </p>
                                                <Link
                                                    to={`/blog/${blog.id}`}
                                                    className="blog-link"
                                                    style={{ color: "#1976d2", fontWeight: 500, fontSize: "0.9rem" }}
                                                >
                                                    Đọc thêm <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationCustom
                            currentPage={currentPage + 1} // Component dùng 1-indexed
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </Container>
    );
}
