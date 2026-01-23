import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../../../assets/css/home/Blogs/BlogSection.css";

export default function BlogSection({ blogs, viewMode = "grid", showHeader = true }) {
    return (
        <section className="blog-section">
            <Container>
                {showHeader && (
                    <div className="section-header">
                        <h2 className="section-title">Tin Tức & Đánh Giá</h2>
                        <p className="section-subtitle">
                            Cập nhật tin tức công nghệ mới nhất
                        </p>
                    </div>
                )}
                <Row>
                    {blogs.map((blog) => (
                        <Col
                            lg={viewMode === "grid" ? 4 : 12}
                            md={viewMode === "grid" ? 6 : 12}
                            key={blog.id}
                            className="mb-4"
                        >
                            <Card className={`blog-card ${viewMode === "list" ? "blog-card-list" : ""}`}>
                                <div className="blog-image">
                                    <img src={blog.image} alt={blog.title} />
                                    <Badge className="blog-category">Tin tức</Badge>
                                </div>
                                <Card.Body>
                                    <div className="blog-meta">
                                        <span>
                                            <i className="bi bi-calendar3"></i> {blog.date}
                                        </span>
                                        <span>
                                            <i className="bi bi-eye"></i> {blog.views} views
                                        </span>
                                    </div>
                                    <h5 className="blog-title">{blog.title}</h5>
                                    <p className="blog-excerpt">{blog.excerpt}</p>
                                    <Link to={`/blog/${blog.id}`} className="blog-link">
                                        Đọc thêm <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

BlogSection.propTypes = {
    blogs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            excerpt: PropTypes.string.isRequired,
            image: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            views: PropTypes.string.isRequired,
        })
    ).isRequired,
    viewMode: PropTypes.oneOf(["grid", "list"]),
    showHeader: PropTypes.bool,
};
