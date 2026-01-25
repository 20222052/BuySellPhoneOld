import { useState, useEffect } from "react";
import classNames from "classnames";
import "@/assets/css/home/ProductDetail.css";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Badge,
    Tab,
    Nav,
    Spinner,
    Toast,
    ToastContainer
} from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LatestProducts from "@/components/common/LatestProducts";
import ProductItemService from "../../services/productItemService";
import { addToCart, clearCartError, clearCartSuccess } from "../../store/slices/cartSlice";
import { RoutePaths } from "../../routes/RoutePaths";

export default function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isTradeIn = location.state?.isTradeIn;

    // Redux state
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { loading: cartLoading, error: cartError, success: cartSuccess } = useSelector((state) => state.cart);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");

    const [latestProducts, setLatestProducts] = useState([]);
    const [tab, setTab] = useState("desc");

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    /* ================= FETCH PRODUCT DETAIL ================= */
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await ProductItemService.getDetails(id);
                const data = res?.data;

                if (!data) throw new Error("Không có dữ liệu sản phẩm");

                setProduct(data);

                // Default model
                const defaultModel = data.models?.[0] || null;
                setSelectedModel(defaultModel);

                // Default color theo model
                if (defaultModel?.colors?.length) {
                    setSelectedColor(defaultModel.colors[0]);
                }

                // Primary image
                const primaryImg = data.media?.find(m => m.primary)?.url;
                setSelectedImage(primaryImg || "");
            } catch (err) {
                setError(err.message || "Lỗi tải sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    /* ================= FETCH LATEST PRODUCTS ================= */
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await ProductItemService.getAllForList({
                    sortBy: "createdAt",
                    sortDir: "DESC",
                    page: 0,
                    pageSize: 6
                });
                setLatestProducts(res?.data?.items || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchLatest();
    }, []);

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price || 0);

    /* ================= HANDLE ADD TO CART ================= */
    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setToastMessage("Vui lòng đăng nhập để thêm vào giỏ hàng!");
            setToastVariant("warning");
            setShowToast(true);
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        if (!selectedColor) {
            setToastMessage("Vui lòng chọn màu sắc!");
            setToastVariant("warning");
            setShowToast(true);
            return;
        }

        if (selectedColor.qtyAvailable <= 0) {
            setToastMessage("Sản phẩm này đã hết hàng!");
            setToastVariant("danger");
            setShowToast(true);
            return;
        }

        dispatch(addToCart({
            userId: user.id,
            productColorId: selectedColor.id,
            quantity: 1
        }));
    };

    // Watch cart success/error
    useEffect(() => {
        if (cartSuccess) {
            setToastMessage(cartSuccess);
            setToastVariant("success");
            setShowToast(true);
            dispatch(clearCartSuccess());
        }
    }, [cartSuccess, dispatch]);

    useEffect(() => {
        if (cartError) {
            setToastMessage(cartError);
            setToastVariant("danger");
            setShowToast(true);
            dispatch(clearCartError());
        }
    }, [cartError, dispatch]);

    /* ================= LOADING / ERROR ================= */
    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <div className="alert alert-danger">{error}</div>
            </Container>
        );
    }

    if (!product) return null;

    // ================= convert color ====================
    const getContrastTextColor = (hex) => {
        if (!hex) return '#000';

        const color = hex.replace('#', '');

        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        // Công thức độ sáng
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Màu sáng → chữ đen, màu tối → chữ trắng
        return brightness > 150 ? '#000' : '#fff';
    };


    /* ================= RENDER ================= */
    return (
        <Container className="py-3">
            {/* ===== PRODUCT HEADER ===== */}
            <Card className="product-detail-header mb-3 border-0 shadow-sm">
                <Row>
                    <Col md={5} className="text-center">
                        <img
                            src={selectedImage || "https://via.placeholder.com/300"}
                            alt={product.productName}
                            className="product-detail-image"
                        />
                        {/* Thumbnails media */}
                        {product.media && product.media.length > 1 && (
                            <div className="product-detail-thumbnails mt-3 d-flex flex-wrap gap-2 justify-content-start">
                                {product.media.map((m, idx) => (
                                    <img
                                        key={m.url || idx}
                                        src={m.url}
                                        alt={"media-" + idx}
                                        className={classNames("product-detail-thumb-img", {
                                            selected: selectedImage === m.url
                                        })}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                            border: selectedImage === m.url ? "2px solid #d70018" : "1px solid #eee",
                                            cursor: "pointer",
                                            boxShadow: selectedImage === m.url ? "0 2px 8px rgba(215,0,24,0.12)" : "none",
                                            transition: "border 0.2s, box-shadow 0.2s"
                                        }}
                                        onClick={() => setSelectedImage(m.url)}
                                    />
                                ))}
                            </div>
                        )}
                    </Col>

                    <Col md={7}>
                        <h3 className="product-detail-title">
                            {product.productName} – {product.name}
                        </h3>

                        <div className="product-detail-price mb-2">
                            {formatPrice(product.sellPrice)}₫
                            {product.comparePrice && (
                                <span className="product-detail-compare-price">
                                    {formatPrice(product.comparePrice)}₫
                                </span>
                            )}
                        </div>

                        {/* ===== MODELS ===== */}
                        <div className="product-detail-models mb-3">
                            <Form.Label>Phiên bản</Form.Label>
                            <div>
                                {product.models.map(model => (
                                    <Button
                                        key={model.id}
                                        className="me-2 mb-2"
                                        variant={
                                            selectedModel?.id === model.id
                                                ? "primary"
                                                : "outline-primary"
                                        }
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setSelectedColor(model.colors?.[0] || null);
                                        }}
                                    >
                                        {model.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* ===== COLORS BY MODEL ===== */}
                        {selectedModel?.colors?.length > 0 && (
                            <div className="product-detail-colors mb-3">
                                <Form.Label>Màu sắc</Form.Label>
                                <div>
                                    {selectedModel.colors.map(color => (
                                        <Button
                                            key={color.id}
                                            className="me-2 mb-2"
                                            style={{
                                                backgroundColor: color.hexCode,
                                                color: getContrastTextColor(color.hexCode),
                                                border: selectedColor?.id === color.id ? '2.5px solid #222' : '1.5px solid #fff',
                                                fontWeight: 700,
                                                boxShadow: selectedColor?.id === color.id ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                                                minWidth: 90,
                                                padding: '8px 18px',
                                                borderRadius: 20,
                                                textShadow: '0 1px 4px rgba(0,0,0,0.12)'
                                            }}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ===== STOCK ===== */}
                        <div className="product-detail-stock mb-3">
                            <strong>Tồn kho:</strong>{" "}
                            {selectedColor?.qtyAvailable ?? 0} sản phẩm
                        </div>

                        {isTradeIn ? (
                            <Button
                                size="lg"
                                variant="danger"
                                className="w-100"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        setToastMessage("Vui lòng đăng nhập để thực hiện Trade-in!");
                                        setToastVariant("warning");
                                        setShowToast(true);
                                        setTimeout(() => navigate("/login"), 1500);
                                        return;
                                    }
                                    // Navigate to TradeInDetail page with context
                                    navigate(RoutePaths.TRADEIN_DETAIL, {
                                        state: {
                                            product: product,
                                            selectedModel: selectedModel,
                                            selectedColor: selectedColor
                                        }
                                    });
                                }}
                                disabled={cartLoading || (selectedColor?.qtyAvailable ?? 0) <= 0}
                            >
                                {cartLoading ? <Spinner size="sm" /> : "Đổi ngay"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    variant="danger"
                                    onClick={() => {
                                        handleAddToCart();
                                        if (isAuthenticated && selectedColor) {
                                            setTimeout(() => navigate("/cart"), 500);
                                        }
                                    }}
                                    disabled={cartLoading || (selectedColor?.qtyAvailable ?? 0) <= 0}
                                >
                                    {cartLoading ? <Spinner size="sm" /> : "Mua ngay"}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={handleAddToCart}
                                    disabled={cartLoading || (selectedColor?.qtyAvailable ?? 0) <= 0}
                                >
                                    {cartLoading ? <Spinner size="sm" /> : "Thêm vào giỏ"}
                                </Button>
                            </>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* ===== TABS ===== */}
            <Card className="mb-3 p-3 border-0 shadow-sm">
                <Tab.Container activeKey={tab} onSelect={setTab}>
                    <Nav variant="tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="desc">Mô tả</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="specs">Thông số kỹ thuật</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="review">Đánh giá</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content className="pt-3">
                        <Tab.Pane eventKey="desc">
                            {product.description ? (
                                <div
                                    className="product-detail-description"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            ) : (
                                "Chưa có mô tả"
                            )}
                        </Tab.Pane>
                        <Tab.Pane eventKey="specs">
                            <div className="product-specs">
                                {/* Màn hình */}
                                {(product.screenSize || product.screenTechnology || product.screenResolution || product.refreshRate || product.screenType || product.screenFeatures) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-phone me-2"></i>Màn hình
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.screenSize && <tr><td>Kích thước màn hình</td><td>{product.screenSize}"</td></tr>}
                                                {product.screenTechnology && <tr><td>Công nghệ màn hình</td><td>{product.screenTechnology}</td></tr>}
                                                {product.screenResolution && <tr><td>Độ phân giải</td><td>{product.screenResolution}</td></tr>}
                                                {product.refreshRate && <tr><td>Tần số quét</td><td>{product.refreshRate}Hz</td></tr>}
                                                {product.screenType && <tr><td>Kiểu màn hình</td><td>{product.screenType}</td></tr>}
                                                {product.screenFeatures && <tr><td>Tính năng màn hình</td><td>{product.screenFeatures}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Camera */}
                                {(product.rearCamera || product.rearVideo || product.rearCameraFeatures || product.frontCamera || product.frontVideo) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-camera me-2"></i>Camera
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.rearCamera && <tr><td>Camera sau</td><td>{product.rearCamera}</td></tr>}
                                                {product.rearVideo && <tr><td>Quay video (sau)</td><td>{product.rearVideo}</td></tr>}
                                                {product.rearCameraFeatures && <tr><td>Tính năng camera sau</td><td>{product.rearCameraFeatures}</td></tr>}
                                                {product.frontCamera && <tr><td>Camera trước</td><td>{product.frontCamera}</td></tr>}
                                                {product.frontVideo && <tr><td>Quay video (trước)</td><td>{product.frontVideo}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Chip & RAM */}
                                {(product.chipset || product.cpu || product.gpu || product.operatingSystem) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-cpu me-2"></i>Chip & RAM
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.chipset && <tr><td>Chipset</td><td>{product.chipset}</td></tr>}
                                                {product.cpu && <tr><td>CPU</td><td>{product.cpu}</td></tr>}
                                                {product.gpu && <tr><td>GPU</td><td>{product.gpu}</td></tr>}
                                                {product.operatingSystem && <tr><td>Hệ điều hành</td><td>{product.operatingSystem}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Kết nối */}
                                {(product.network || product.simType || product.wifi || product.bluetooth || product.nfc || product.gps || product.chargingPort) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-wifi me-2"></i>Kết nối
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.network && <tr><td>Mạng</td><td>{product.network}</td></tr>}
                                                {product.simType && <tr><td>Loại SIM</td><td>{product.simType}</td></tr>}
                                                {product.wifi && <tr><td>Wi-Fi</td><td>{product.wifi}</td></tr>}
                                                {product.bluetooth && <tr><td>Bluetooth</td><td>{product.bluetooth}</td></tr>}
                                                {product.nfc && <tr><td>NFC</td><td>{product.nfc}</td></tr>}
                                                {product.gps && <tr><td>GPS</td><td>{product.gps}</td></tr>}
                                                {product.chargingPort && <tr><td>Cổng sạc</td><td>{product.chargingPort}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pin & Sạc */}
                                {(product.batteryCapacity || product.chargingPower || product.chargingTechnology) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-battery-charging me-2"></i>Pin & Sạc
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.batteryCapacity && <tr><td>Dung lượng pin</td><td>{product.batteryCapacity} mAh</td></tr>}
                                                {product.chargingPower && <tr><td>Công suất sạc</td><td>{product.chargingPower}W</td></tr>}
                                                {product.chargingTechnology && <tr><td>Công nghệ sạc</td><td>{product.chargingTechnology}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Kích thước & Khác */}
                                {(product.dimensions || product.weight || product.waterResistance || product.sensors || product.releaseTime) && (
                                    <div className="specs-group mb-4">
                                        <h5 className="specs-group-title">
                                            <i className="bi bi-rulers me-2"></i>Kích thước & Khác
                                        </h5>
                                        <table className="table table-striped specs-table">
                                            <tbody>
                                                {product.dimensions && <tr><td>Kích thước</td><td>{product.dimensions}</td></tr>}
                                                {product.weight && <tr><td>Trọng lượng</td><td>{product.weight}g</td></tr>}
                                                {product.waterResistance && <tr><td>Kháng nước/bụi</td><td>{product.waterResistance}</td></tr>}
                                                {product.releaseTime && <tr><td>Thời điểm ra mắt</td><td>{product.releaseTime}</td></tr>}
                                                {product.sensors && <tr><td>Cảm biến</td><td>{product.sensors}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Hiển thị khi không có thông số */}
                                {!product.screenSize && !product.screenTechnology && !product.rearCamera && !product.chipset && !product.network && !product.batteryCapacity && !product.dimensions && (
                                    <div className="text-muted text-center py-4">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Chưa có thông số kỹ thuật
                                    </div>
                                )}
                            </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="review">
                            Chưa có đánh giá
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Card>

            {/* ===== LATEST PRODUCTS ===== */}
            <LatestProducts products={latestProducts} />

            {/* ===== TOAST NOTIFICATIONS ===== */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header>
                        <strong className="me-auto">
                            {toastVariant === "success" ? "Thành công" :
                                toastVariant === "warning" ? "Cảnh báo" : "Lỗi"}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === "success" || toastVariant === "danger" ? "text-white" : ""}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}
