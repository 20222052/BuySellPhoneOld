
import { useState } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import BlogSection from "../../components/common/Home/BlogSection";
import PaginationCustom from "../../components/common/PaginationCustom";
import { Container } from "react-bootstrap";

// Dữ liệu mẫu
const allBlogs = [
    {
        id: 1,
        title: "Top 5 điện thoại cũ đáng mua nhất tháng 11/2025",
        excerpt: "Khám phá những chiếc điện thoại cũ có giá tốt nhất trong tháng với hiệu năng vượt trội...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "13/11/2025",
        views: "1.2K",
    },
    {
        id: 2,
        title: "Hướng dẫn kiểm tra điện thoại cũ trước khi mua",
        excerpt: "Những bước cơ bản để kiểm tra máy cũ tránh mua phải hàng lỗi, hàng dựng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "12/11/2025",
        views: "2.5K",
    },
    {
        id: 3,
        title: "So sánh iPhone 13 vs iPhone 14: Nên chọn máy nào?",
        excerpt: "Phân tích chi tiết sự khác biệt giữa iPhone 13 và iPhone 14 để đưa ra lựa chọn phù hợp...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "11/11/2025",
        views: "3.8K",
    },
    {
        id: 4,
        title: "Cách bảo quản điện thoại cũ bền lâu",
        excerpt: "Một số mẹo nhỏ giúp bạn giữ điện thoại cũ luôn như mới...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "10/11/2025",
        views: "1.1K",
    },
    {
        id: 5,
        title: "Có nên mua điện thoại flagship cũ?",
        excerpt: "Đánh giá ưu nhược điểm khi chọn mua flagship đã qua sử dụng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "09/11/2025",
        views: "2.0K",
    },
    {
        id: 6,
        title: "Những lưu ý khi mua điện thoại online",
        excerpt: "Kinh nghiệm chọn mua điện thoại cũ online an toàn, uy tín...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "08/11/2025",
        views: "1.7K",
    },
    {
        id: 1,
        title: "Top 5 điện thoại cũ đáng mua nhất tháng 11/2025",
        excerpt: "Khám phá những chiếc điện thoại cũ có giá tốt nhất trong tháng với hiệu năng vượt trội...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "13/11/2025",
        views: "1.2K",
    },
    {
        id: 2,
        title: "Hướng dẫn kiểm tra điện thoại cũ trước khi mua",
        excerpt: "Những bước cơ bản để kiểm tra máy cũ tránh mua phải hàng lỗi, hàng dựng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "12/11/2025",
        views: "2.5K",
    },
    {
        id: 3,
        title: "So sánh iPhone 13 vs iPhone 14: Nên chọn máy nào?",
        excerpt: "Phân tích chi tiết sự khác biệt giữa iPhone 13 và iPhone 14 để đưa ra lựa chọn phù hợp...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "11/11/2025",
        views: "3.8K",
    },
    {
        id: 4,
        title: "Cách bảo quản điện thoại cũ bền lâu",
        excerpt: "Một số mẹo nhỏ giúp bạn giữ điện thoại cũ luôn như mới...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "10/11/2025",
        views: "1.1K",
    },
    {
        id: 5,
        title: "Có nên mua điện thoại flagship cũ?",
        excerpt: "Đánh giá ưu nhược điểm khi chọn mua flagship đã qua sử dụng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "09/11/2025",
        views: "2.0K",
    },
    {
        id: 6,
        title: "Những lưu ý khi mua điện thoại online",
        excerpt: "Kinh nghiệm chọn mua điện thoại cũ online an toàn, uy tín...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "08/11/2025",
        views: "1.7K",
    },
    {
        id: 1,
        title: "Top 5 điện thoại cũ đáng mua nhất tháng 11/2025",
        excerpt: "Khám phá những chiếc điện thoại cũ có giá tốt nhất trong tháng với hiệu năng vượt trội...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "13/11/2025",
        views: "1.2K",
    },
    {
        id: 2,
        title: "Hướng dẫn kiểm tra điện thoại cũ trước khi mua",
        excerpt: "Những bước cơ bản để kiểm tra máy cũ tránh mua phải hàng lỗi, hàng dựng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "12/11/2025",
        views: "2.5K",
    },
    {
        id: 3,
        title: "So sánh iPhone 13 vs iPhone 14: Nên chọn máy nào?",
        excerpt: "Phân tích chi tiết sự khác biệt giữa iPhone 13 và iPhone 14 để đưa ra lựa chọn phù hợp...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "11/11/2025",
        views: "3.8K",
    },
    {
        id: 4,
        title: "Cách bảo quản điện thoại cũ bền lâu",
        excerpt: "Một số mẹo nhỏ giúp bạn giữ điện thoại cũ luôn như mới...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "10/11/2025",
        views: "1.1K",
    },
    {
        id: 5,
        title: "Có nên mua điện thoại flagship cũ?",
        excerpt: "Đánh giá ưu nhược điểm khi chọn mua flagship đã qua sử dụng...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "09/11/2025",
        views: "2.0K",
    },
    {
        id: 6,
        title: "Những lưu ý khi mua điện thoại online",
        excerpt: "Kinh nghiệm chọn mua điện thoại cũ online an toàn, uy tín...",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "08/11/2025",
        views: "1.7K",
    },
    // ... thêm blog nếu muốn test phân trang
];

const blogsPerPage = 11;

export default function Blogs() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
    const paginatedBlogs = allBlogs.slice(
        (currentPage - 1) * blogsPerPage,
        currentPage * blogsPerPage
    );

    // Bố cục báo: bài đầu là nổi bật, các bài còn lại chia 2 cột
    const featuredBlog = paginatedBlogs[0];
    const otherBlogs = paginatedBlogs.slice(1);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Container className="blogs-page py-4">
            <h2 className="mb-4">Tin tức & Đánh giá</h2>
            {/* Bài nổi bật */}
            {featuredBlog && (
                <Card className="mb-4 shadow-sm border-0" style={{ minHeight: 320 }}>
                    <Row className="g-0">
                        <Col md={6} className="d-flex align-items-stretch">
                            <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "12px 0 0 12px", background: "#f8f9fa" }}>
                                <img src={featuredBlog.image} alt={featuredBlog.title} style={{ width: "100%", height: 320, objectFit: "cover" }} />
                            </div>
                        </Col>
                        <Col md={6} className="d-flex align-items-center">
                            <Card.Body>
                                <Badge bg="primary" className="mb-2">Tin nổi bật</Badge>
                                <div className="blog-meta mb-2" style={{ color: "#888" }}>
                                    <span><i className="bi bi-calendar3"></i> {featuredBlog.date}</span>
                                    <span className="ms-3"><i className="bi bi-eye"></i> {featuredBlog.views} views</span>
                                </div>
                                <h3 className="fw-bold mb-2">{featuredBlog.title}</h3>
                                <p className="mb-3" style={{ fontSize: "1.1rem" }}>{featuredBlog.excerpt}</p>
                                <Link to={`/blog/${featuredBlog.id}`} className="blog-link" style={{ color: "#d32f2f", fontWeight: 500 }}>Đọc thêm <i className="bi bi-arrow-right"></i></Link>
                            </Card.Body>
                        </Col>
                    </Row>
                </Card>
            )}
            {/* Các bài còn lại chia 2 cột */}
            <Row>
                {otherBlogs.map(blog => (
                    <Col md={6} key={blog.id} className="mb-4">
                        <Card className="h-100 shadow-sm border-0">
                            <Row className="g-0">
                                <Col xs={5} className="d-flex align-items-stretch">
                                    <div style={{ width: "100%", height: 160, overflow: "hidden", borderRadius: "12px 0 0 12px", background: "#f8f9fa" }}>
                                        <img src={blog.image} alt={blog.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                                    </div>
                                </Col>
                                <Col xs={7} className="d-flex align-items-center">
                                    <Card.Body>
                                        <div className="blog-meta mb-1" style={{ color: "#888", fontSize: "0.95rem" }}>
                                            <span><i className="bi bi-calendar3"></i> {blog.date}</span>
                                            <span className="ms-3"><i className="bi bi-eye"></i> {blog.views} views</span>
                                        </div>
                                        <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>{blog.title}</h5>
                                        <p className="mb-2" style={{ fontSize: "0.98rem", color: "#555" }}>{blog.excerpt}</p>
                                        <Link to={`/blog/${blog.id}`} className="blog-link" style={{ color: "#1976d2", fontWeight: 500 }}>Đọc thêm <i className="bi bi-arrow-right"></i></Link>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
            <PaginationCustom
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </Container>
    );
}
