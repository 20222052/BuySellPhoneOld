import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import BlogService from "../../services/blogService";
import BlogComments from "./BlogComments";
import "../../assets/css/home/Blogs/BlogDetail.css";

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
                const response = await BlogService.getPublicList({ page: 0, pageSize: 5 });
                // Filter out current blog
                const others = (response.data.items || []).filter(b => b.id !== id).slice(0, 5);
                setRelatedBlogs(others);
            } catch (err) {
                console.error("Không thể tải bài viết liên quan:", err);
            }
        };

        if (id) {
            fetchBlog();
            fetchRelatedBlogs();
        }
        // Scroll to top when id changes
        window.scrollTo(0, 0);
    }, [id]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="py-5 text-center" style={{ minHeight: "50vh" }}>
                <Spinner animation="border" variant="danger" />
                <p className="mt-2">Đang tải nội dung...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <div className="mt-3">
                        <Link to="/blogs" className="btn btn-outline-danger">
                            Quay lại tin tức
                        </Link>
                    </div>
                </Alert>
            </Container>
        );
    }

    if (!blog) return null;

    return (
        <div className="blog-detail-page py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        {/* Banner Image if available */}
                        {blog.imageUrl && (
                            <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="blog-header-image"
                            />
                        )}

                        {/* Title */}
                        <h1 className="blog-title">{blog.title}</h1>

                        {/* Author Meta */}
                        <div className="blog-author-meta">
                            <img
                                src="https://ui-avatars.com/api/?name=Hai+Nam&background=random"
                                alt="Author"
                                className="author-avatar"
                            />
                            <div className="author-info">
                                <span className="author-name">
                                    {blog.author || blog.createdByUserName || "Hải Nam"}
                                </span>
                                <span className="blog-date">
                                    <i className="bi bi-calendar-event"></i>
                                    Ngày cập nhật: {formatDate(blog.updatedAt || blog.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Intro / Excerpt */}
                        {/* Assuming first paragraph is intro, or use excerpt if available separately */}
                        <div className="blog-intro">
                            {blog.title} - {blog.shortDescription || "Xiaomi chính thức giới thiệu sản phẩm mới..."}
                        </div>

                        {/* Main Content */}
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Comments Section */}
                        <BlogComments blogId={id} />
                    </Col>

                    {/* Sidebar for related posts (optional, or below) */}
                    {/* For match design in image, it looks like a single column mostly, 
                        but let's put related posts below or in sidebar if wide screen. 
                        The image shows a clean reading view. Let's stick to centered content. */}
                </Row>

                {/* Related Posts Section at bottom */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-5 pt-4 border-top text-start">
                        <h3 className="mb-4 fw-bold">Tin tức liên quan</h3>
                        <Row>
                            {relatedBlogs.map(item => (
                                <Col md={4} className="mb-4" key={item.id}>
                                    <Link to={`/blogs/${item.id}`} className="text-decoration-none text-dark">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div style={{ height: "200px", overflow: "hidden", borderRadius: "8px 8px 0 0" }}>
                                                <img
                                                    src={item.imageUrl || "https://via.placeholder.com/300x200"}
                                                    alt={item.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </div>
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-2 line-clamp-2">{item.title}</h6>
                                                <small className="text-muted">{formatDate(item.createdAt)}</small>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
            </Container>
        </div>
    );
}
