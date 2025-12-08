import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../assets/css/home/Footer.css';

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  };

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <Container>
          <Row className="g-4">
            {/* About Section */}
            <Col lg={3} md={6}>
              <div className="footer-section">
                <h5 className="footer-title">
                  <i className="bi bi-phone me-2"></i>
                  BuySellPhoneOld
                </h5>
                <p className="footer-text">
                  Chuyên cung thu mua cung cấp điện thoại cũ, uy tín, giá tốt.
                  Cam kết chất lượng, bảo hành chu đáo.
                </p>
                <div className="social-links">
                  <a href="https://facebook.com" className="social-link">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://instagram.com" className="social-link">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://twitter.com" className="social-link">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="https://youtube.com" className="social-link">
                    <i className="bi bi-youtube"></i>
                  </a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6}>
              <div className="footer-section">
                <h5 className="footer-title">Liên Kết</h5>
                <ul className="footer-links">
                  <li>
                    <Link to="/">
                      <i className="bi bi-chevron-right"></i>Trang Chủ
                    </Link>
                  </li>
                  <li>
                    <Link to="/products">
                      <i className="bi bi-chevron-right"></i>Sản Phẩm
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog">
                      <i className="bi bi-chevron-right"></i>Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/tradein">
                      <i className="bi bi-chevron-right"></i>Trade-in
                    </Link>
                  </li>
                  <li>
                    <Link to="/about">
                      <i className="bi bi-chevron-right"></i>Về Chúng Tôi
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>

            {/* Store Info */}
            <Col lg={3} md={6}>
              <div className="footer-section">
                <h5 className="footer-title">Thông Tin Cửa Hàng</h5>
                <ul className="footer-info">
                  <li>
                    <i className="bi bi-geo-alt-fill"></i>
                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                  </li>
                  <li>
                    <i className="bi bi-telephone-fill"></i>
                    <a href="tel:0123456789">0123 456 789</a>
                  </li>
                  <li>
                    <i className="bi bi-envelope-fill"></i>
                    <a href="mailto:info@buysellphoneold.com">info@buysellphoneold.com</a>
                  </li>
                  <li>
                    <i className="bi bi-clock-fill"></i>
                    <span>8:00 - 22:00 (Hằng ngày)</span>
                  </li>
                </ul>
              </div>
            </Col>

            {/* Feedback Form */}
            <Col lg={4} md={6}>
              <div className="footer-section">
                <h5 className="footer-title">Gửi Phản Hồi</h5>
                <Form onSubmit={handleSubmit} className="feedback-form">
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Họ và tên"
                      className="form-input"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="email"
                      placeholder="Email của bạn"
                      className="form-input"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Nội dung phản hồi..."
                      className="form-input"
                      required
                    />
                  </Form.Group>
                  <Button type="submit" className="submit-btn w-100">
                    <i className="bi bi-send me-2"></i>
                    Gửi Phản Hồi
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <p className="copyright mb-0">
                © {new Date().getFullYear()} BuySellPhoneOld. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="footer-bottom-links">
                <Link to="/privacy">Chính Sách Bảo Mật</Link>
                <span className="separator">|</span>
                <Link to="/terms">Điều Khoản Sử Dụng</Link>
                <span className="separator">|</span>
                <Link to="/warranty">Chính Sách Bảo Hành</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}
