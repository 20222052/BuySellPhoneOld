import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import LatestProducts from "@/components/common/LatestProducts";
import BlogService from "../../services/blogService";

export default function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch blog detail
    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await BlogService.getById(id);
                setBlog(response.data);
            } catch (err) {
                setError(err.message || "Không thể tải bài viết");
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedBlogs = async () => {
            try {
                const response = await BlogService.getAll({ page: 0, pageSize: 4 });
                // Lọc bỏ blog hiện tại
                const others = (response.data.items || []).filter(b => b.id !== id).slice(0, 2);
                setRelatedBlogs(others);
            } catch (err) {
                console.error("Không thể tải bài viết liên quan:", err);
            }
        };

        if (id) {
            fetchBlog();
            fetchRelatedBlogs();
        }
    }, [id]);

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

    // Loading state
    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải bài viết...</p>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <div className="mt-3">
                        <Link to="/blog" className="btn btn-primary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại danh sách
                        </Link>
                    </div>
                </Alert>
            </Container>
        );
    }

    // Not found state
    if (!blog) {
        return (
            <Container className="py-5">
                <Alert variant="warning" className="text-center">
                    <i className="bi bi-file-earmark-x me-2"></i>
                    Không tìm thấy bài viết
                    <div className="mt-3">
                        <Link to="/blog" className="btn btn-primary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại danh sách
                        </Link>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">Trang chủ</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/blog">Tin tức</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {blog.title?.substring(0, 30)}...
                    </li>
                </ol>
            </nav>

            <Row className="justify-content-center">
                <Col md={9} lg={8}>
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        {/* Title */}
                        <h1 className="fw-bold mb-3">{blog.title}</h1>

                        {/* Meta info */}
                        <div className="mb-3 d-flex flex-wrap gap-3" style={{ color: "#666" }}>
                            <span>
                                <i className="bi bi-calendar3 me-1"></i>
                                {formatDate(blog.createdAt)}
                            </span>
                            <span>
                                <i className="bi bi-eye me-1"></i>
                                {formatViews(blog.viewCount)} lượt xem
                            </span>
                            {blog.author && (
                                <span>
                                    <i className="bi bi-person me-1"></i>
                                    {blog.author}
                                </span>
                            )}
                            {blog.createdByUserName && (
                                <span>
                                    <i className="bi bi-pencil me-1"></i>
                                    Tác giả: {blog.createdByUserName}
                                </span>
                            )}
                        </div>

                        {/* Updated info */}
                        {blog.updatedAt && blog.updatedByUserName && (
                            <div className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
                                <i className="bi bi-clock-history me-1"></i>
                                Cập nhật lần cuối: {formatDate(blog.updatedAt)} bởi {blog.updatedByUserName}
                            </div>
                        )}

                        {/* Featured Image */}
                        {blog.imageUrl && (
                            <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="mb-4"
                                style={{
                                    width: "100%",
                                    maxHeight: 400,
                                    objectFit: "cover",
                                    borderRadius: 12
                                }}
                            />
                        )}

                        {/* Content */}
                        <div
                            className="blog-content mb-4"
                            style={{
                                lineHeight: 1.8,
                                fontSize: "1.05rem",
                                color: "#333"
                            }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Share buttons */}
                        <div className="mb-3 pt-3 border-top">
                            <span className="me-2 fw-bold">Chia sẻ:</span>
                            <Button size="sm" variant="outline-primary" className="me-1">
                                <i className="bi bi-facebook"></i>
                            </Button>
                            <Button size="sm" variant="outline-info" className="me-1">
                                <i className="bi bi-twitter"></i>
                            </Button>
                            <Button size="sm" variant="outline-success" className="me-1">
                                <i className="bi bi-whatsapp"></i>
                            </Button>
                            <Button size="sm" variant="outline-secondary">
                                <i className="bi bi-link-45deg"></i>
                            </Button>
                        </div>
                    </Card>

                    {/* Related blogs */}
                    {relatedBlogs.length > 0 && (
                        <Card className="p-4 border-0 shadow-sm mb-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-newspaper me-2"></i>
                                Bài viết liên quan
                            </h5>
                            <Row>
                                {relatedBlogs.map(b => (
                                    <Col md={6} key={b.id} className="mb-3">
                                        <Card className="h-100 border-0 shadow-sm">
                                            <Link to={`/blog/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                                <Card.Img
                                                    variant="top"
                                                    src={b.imageUrl || "https://via.placeholder.com/300x150?text=No+Image"}
                                                    style={{ height: 120, objectFit: "cover" }}
                                                />
                                                <Card.Body>
                                                    <div className="fw-bold" style={{ fontSize: "0.95rem", lineHeight: 1.3 }}>
                                                        {b.title}
                                                    </div>
                                                    <div className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {formatDate(b.createdAt)}
                                                    </div>
                                                </Card.Body>
                                            </Link>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    )}

                    {/* Back to list */}
                    <div className="text-center mb-4">
                        <Link to="/blog" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Xem tất cả bài viết
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
