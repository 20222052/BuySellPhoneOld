
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button, Form } from "react-bootstrap";
import { useState } from "react";
import LatestProducts from "@/components/common/LatestProducts";

// Dữ liệu mẫu
const blog = {
    id: 1,
    title: "Top 5 điện thoại cũ đáng mua nhất tháng 11/2025",
    image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
    date: "13/11/2025",
    views: "1.2K",
    content: `
		<p>Khám phá những chiếc điện thoại cũ có giá tốt nhất trong tháng với hiệu năng vượt trội, camera chất lượng và pin bền bỉ. Dưới đây là top 5 lựa chọn nổi bật:</p>
		<ol>
			<li><b>iPhone 13 Pro Max</b>: Hiệu năng mạnh, camera xuất sắc, pin lâu.</li>
			<li><b>Samsung Galaxy S23 Ultra</b>: Màn hình lớn, camera zoom ấn tượng.</li>
			<li><b>Xiaomi 13 Pro</b>: Giá tốt, cấu hình cao, sạc nhanh.</li>
			<li><b>OPPO Find X5 Pro</b>: Thiết kế đẹp, camera AI thông minh.</li>
			<li><b>Vivo V27 Pro</b>: Ảnh selfie đẹp, pin ổn định.</li>
		</ol>
		<p>Mỗi sản phẩm đều có ưu điểm riêng, phù hợp với nhiều nhu cầu sử dụng khác nhau.</p>
	`,
    tags: ["điện thoại cũ", "review", "top 5", "tháng 11/2025"],
    comments: [
        { user: "Nguyễn Văn A", comment: "Bài viết rất hữu ích!", date: "14/11/2025" },
        { user: "Trần Thị B", comment: "Cảm ơn ad, mình đã chọn được máy phù hợp.", date: "15/11/2025" },
    ],
};


const relatedBlogs = [
    {
        id: 2,
        title: "Hướng dẫn kiểm tra điện thoại cũ trước khi mua",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "12/11/2025",
    },
    {
        id: 3,
        title: "So sánh iPhone 13 vs iPhone 14: Nên chọn máy nào?",
        image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
        date: "11/11/2025",
    },
];

const latestProducts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 10,
    name: `Sản phẩm mới ${i + 1}`,
    image: "https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-sierra-blue-600x600.jpg",
    price: "12.990.000",
}));


export default function BlogDetail() {
    const { id } = useParams();
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState(blog.comments);

    const handleComment = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            setComments([
                ...comments,
                { user: "Khách", comment, date: new Date().toLocaleDateString("vi-VN") },
            ]);
            setComment("");
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={9} lg={8}>
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        <h1 className="fw-bold mb-2">{blog.title}</h1>
                        <div className="mb-2" style={{ color: "#888" }}>
                            <span><i className="bi bi-calendar3"></i> {blog.date}</span>
                            <span className="ms-3"><i className="bi bi-eye"></i> {blog.views} lượt xem</span>
                        </div>
                        <div className="mb-3">
                            {blog.tags.map(tag => (
                                <Badge bg="info" key={tag} className="me-2">#{tag}</Badge>
                            ))}
                        </div>
                        <img src={blog.image} alt={blog.title} className="mb-4" style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: 12 }} />
                        <div className="blog-content mb-4" dangerouslySetInnerHTML={{ __html: blog.content }} />
                        <div className="mb-3">
                            <span className="me-2">Chia sẻ:</span>
                            <Button size="sm" variant="outline-primary" className="me-1"><i className="bi bi-facebook"></i></Button>
                            <Button size="sm" variant="outline-info" className="me-1"><i className="bi bi-twitter"></i></Button>
                            <Button size="sm" variant="outline-danger"><i className="bi bi-envelope"></i></Button>
                        </div>
                    </Card>

                    {/* Bình luận */}
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        <h5 className="fw-bold mb-3">Bình luận</h5>
                        <Form onSubmit={handleComment} className="mb-3">
                            <Form.Group className="d-flex">
                                <Form.Control
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Nhập bình luận..."
                                    className="me-2"
                                />
                                <Button type="submit" variant="primary">Gửi</Button>
                            </Form.Group>
                        </Form>
                        {comments.length === 0 ? <div>Chưa có bình luận.</div> : comments.map((c, idx) => (
                            <div key={idx} className="mb-2 border-bottom pb-2">
                                <strong>{c.user}</strong> <span className="text-muted">({c.date})</span>
                                <div>{c.comment}</div>
                            </div>
                        ))}
                    </Card>

                    {/* Bài viết liên quan */}
                    <Card className="p-4 border-0 shadow-sm mb-4">
                        <h5 className="fw-bold mb-3">Bài viết liên quan</h5>
                        <Row>
                            {relatedBlogs.map(b => (
                                <Col md={6} key={b.id} className="mb-3">
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Link to={`/blog/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <Card.Img variant="top" src={b.image} style={{ height: 120, objectFit: "cover", borderRadius: 8 }} />
                                            <Card.Body>
                                                <div className="fw-bold" style={{ fontSize: "1rem" }}>{b.title}</div>
                                                <div className="text-muted" style={{ fontSize: "0.95rem" }}><i className="bi bi-calendar3"></i> {b.date}</div>
                                            </Card.Body>
                                        </Link>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>
            {/* Sản phẩm mới nhất */}
                    <LatestProducts products={latestProducts} />
        </Container>
    );
}
