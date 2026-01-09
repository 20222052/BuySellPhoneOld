import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 text-center">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Không tìm thấy trang</h2>
          <p className="lead text-muted mb-4">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button onClick={handleGoBack} className="btn btn-outline-secondary btn-lg">
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </button>
            <Link to="/" className="btn btn-primary btn-lg">
              <i className="bi bi-house me-2"></i>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}