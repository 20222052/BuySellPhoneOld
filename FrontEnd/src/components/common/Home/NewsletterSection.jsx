import { Container, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement newsletter subscription logic
        console.log("Newsletter subscription for:", email);
        setEmail("");
    };

    return (
        <section className="newsletter-section">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <div className="newsletter-content">
                            <i className="bi bi-envelope-heart newsletter-icon"></i>
                            <h2>Đăng Ký Nhận Tin</h2>
                            <p>Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
                            <form className="newsletter-form" onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Nhập email của bạn..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Button type="submit">
                                        <i className="bi bi-send-fill me-2"></i>
                                        Đăng Ký
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
