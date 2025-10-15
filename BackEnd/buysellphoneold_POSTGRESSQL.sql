-- Enable UUID extension (available in PostgreSQL 9.1+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =========================================
-- BẢNG NGƯỜI DÙNG (users): tài khoản và thông tin cá nhân
-- =========================================
CREATE TABLE users (
    id             UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK dạng UUID
    full_name      VARCHAR(100) NOT NULL,                                -- Họ tên đầy đủ
    gender         VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')), -- Giới tính giới hạn
    birth_date     DATE,                                                 -- Ngày sinh (tùy chọn)
    email          VARCHAR(100) NOT NULL UNIQUE,                         -- Email duy nhất
    phone          VARCHAR(20) UNIQUE,                                   -- SĐT duy nhất (có thể NULL)
    password       TEXT NOT NULL,                                        -- Mật khẩu (đã hash)
    role           VARCHAR(20) NOT NULL DEFAULT 'customer'               -- Vai trò
                     CHECK (role IN ('admin','customer','staff')),
    status         VARCHAR(20) NOT NULL DEFAULT 'active'                 -- Trạng thái tài khoản
                     CHECK (status IN ('active','inactive')),
    access_token   TEXT,                                                 -- Giá trị token
    refresh_token  TEXT,                                                 -- Giá trị token
    expires_at     TIMESTAMP WITH TIME ZONE,                    -- Thời gian hết hạn token
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Thời điểm tạo
    created_by     UUID,                                                 -- Ai tạo (xóa user tạo -> NULL)
    modified_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Thời điểm cập nhật
    modified_by    UUID                                                  -- Ai cập nhật (xóa -> NULL)
);

ALTER TABLE users ALTER COLUMN expires_at DROP NOT NULL;

-- Add foreign key constraints for users table
ALTER TABLE users ADD CONSTRAINT FK_users_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT FK_users_modified_by 
    FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL;

-- =========================================
-- BẢNG ĐỊA CHỈ (addresses): địa chỉ người dùng/kho
-- =========================================
CREATE TABLE addresses (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    user_id         UUID NOT NULL,                                       -- Thuộc user; xóa user -> xóa địa chỉ
    full_name       VARCHAR(100) NOT NULL,                                -- Tên người nhận/kho
    is_warehouse    BOOLEAN NOT NULL DEFAULT FALSE,                       -- Đánh dấu là địa chỉ kho
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,                       -- Địa chỉ mặc định của user
    phone           VARCHAR(20) NOT NULL,                                 -- SĐT nhận hàng
    address_line    TEXT NOT NULL,                                        -- Số nhà/đường
    ward_name       VARCHAR(100) NOT NULL,                                -- Tên phường/xã
    ward_code       VARCHAR(100) NOT NULL,                                -- Mã phường/xã (đồng bộ đơn vị hành chính)
    district_name   VARCHAR(100),                                         -- Tên quận/huyện
    district_code   VARCHAR(100),                                         -- Mã quận/huyện
    city_name       VARCHAR(100) NOT NULL,                                -- Tên tỉnh/thành
    city_code       VARCHAR(100) NOT NULL,                                -- Mã tỉnh/thành
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_addresses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_addresses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_addresses_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG DANH MỤC (categories): nhóm sản phẩm
-- =========================================
CREATE TABLE categories (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    name            VARCHAR(100) NOT NULL UNIQUE,                         -- Tên danh mục duy nhất
    description     TEXT,                                                 -- Mô tả
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,                        -- Bật/tắt hiển thị
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_categories_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_categories_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG THƯƠNG HIỆU (brands): Apple, Samsung, ...
-- =========================================
CREATE TABLE brands (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    name            VARCHAR(100) NOT NULL UNIQUE,                         -- Tên thương hiệu duy nhất
    logo_url        TEXT,                                                 -- Link logo (tùy chọn)
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_brands_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_brands_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG MÀU SẮC SẢN PHẨM (product_colors)
-- =========================================
CREATE TABLE product_colors (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    name            VARCHAR(50) NOT NULL UNIQUE,                          -- Tên màu duy nhất
    hex_code        VARCHAR(7),                                           -- Mã HEX (vd: #FFFFFF)
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_product_colors_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_colors_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG SẢN PHẨM (products): thông tin chung/marketing
-- =========================================
CREATE TABLE products (
    id               UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    brand_id         UUID NOT NULL,                                       -- Thuộc thương hiệu; không cho xóa brand nếu còn product
    category_id      UUID NOT NULL,                                       -- Thuộc danh mục; không cho xóa category nếu còn product
    name             VARCHAR(200) NOT NULL,                                -- Tên hiển thị
    description      TEXT,                                                 -- Mô tả
    warranty_months  INTEGER NOT NULL DEFAULT 0 CHECK (warranty_months >= 0), -- Số tháng bảo hành
    status           VARCHAR(20) NOT NULL DEFAULT 'active'                 -- Trạng thái danh mục sản phẩm
                     CHECK (status IN ('active','inactive','discontinued')), -- active: bán, inactive: tạm ẩn, discontinued: ngừng bán
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by       UUID,
    modified_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by      UUID,
    CONSTRAINT FK_products_brand_id FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
    CONSTRAINT FK_products_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT FK_products_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_products_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG MODEL SẢN PHẨM (product_models): RAM/ROM, grade
-- =========================================
CREATE TABLE product_models (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    name            VARCHAR(100) NOT NULL,                                -- Tên model (vd: iPhone 12 64GB)
    ram_gb          INTEGER CHECK (ram_gb >= 0),                          -- RAM (GB), có thể 0 nếu không áp dụng
    rom_gb          INTEGER CHECK (rom_gb > 0),                           -- ROM (GB), >0
    grade           VARCHAR(10) CHECK (grade IN ('A','B','C','D')),       -- Tình trạng/đánh giá tổng quát
    description     TEXT,                                                 -- Mô tả model
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_product_models_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_models_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG PHIÊN BẢN SẢN PHẨM (product_items): biến thể có giá/IMEI
-- =========================================
CREATE TABLE product_items (
    id               UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    product_id       UUID NOT NULL,                                       -- Thuộc sản phẩm; xóa product -> xóa biến thể
    model_id         UUID NOT NULL,                                       -- Liên kết model; giữ lịch sử nên RESTRICT
    color_id         UUID NOT NULL,                                       -- Màu sắc; RESTRICT
    base_price       NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),       -- Giá vốn/cơ sở
    sell_price       NUMERIC(12,2) NOT NULL CHECK (sell_price >= 0),       -- Giá bán
    compare_price    NUMERIC(12,2) CHECK (compare_price >= 0),             -- Giá so sánh (giá gạch)
    qty_available    INTEGER NOT NULL DEFAULT 1 CHECK (qty_available >= 0), -- Số lượng sẵn có (tổng quan)
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by       UUID,
    modified_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by      UUID,
    CONSTRAINT FK_product_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT FK_product_items_model_id FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE RESTRICT,
    CONSTRAINT FK_product_items_color_id FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE RESTRICT,
    CONSTRAINT FK_product_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_items_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG CHẨN ĐOÁN SẢN PHẨM (product_diagnostics): báo cáo test máy
-- =========================================
CREATE TABLE product_diagnostics (
    id                   UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    product_item_id      UUID NOT NULL,                                     -- Gắn với biến thể

    -- Chẩn đoán âm thanh và camera
    microphone_damage    BOOLEAN DEFAULT FALSE,                             -- Lỗi micro
    front_camera_damage  BOOLEAN DEFAULT FALSE,                             -- Lỗi camera trước
    rear_camera_damage   BOOLEAN DEFAULT FALSE,                             -- Lỗi camera sau

    -- Chẩn đoán pin và phần cứng khác
    battery_health       NUMERIC(5,2) DEFAULT 100 CHECK (battery_health >= 0 AND battery_health <= 100), -- % sức khỏe pin (0-100%)
    charging_port_damage BOOLEAN DEFAULT FALSE,                             -- Lỗi cổng sạc
    speaker_damage       BOOLEAN DEFAULT FALSE,                             -- Lỗi loa
    button_damage        BOOLEAN DEFAULT FALSE,                             -- Lỗi nút bấm
    wifi_bluetooth_issue BOOLEAN DEFAULT FALSE,                             -- Lỗi WiFi/Bluetooth

    -- Chẩn đoán màn hình
    screen_cracks        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (screen_cracks >= 0 AND screen_cracks <= 100), -- % nứt màn hình
    scratches            NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (scratches >= 0 AND scratches <= 100), -- % trầy xước
    edge_dings           NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (edge_dings >= 0 AND edge_dings <= 100), -- % móp cạnh
    dents                NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (dents >= 0 AND dents <= 100), -- % bị lõm
    display_failure      NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (display_failure >= 0 AND display_failure <= 100), -- % lỗi hiển thị
    dead_pixels          NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (dead_pixels >= 0 AND dead_pixels <= 100), -- % pixel chết
    display_lines        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (display_lines >= 0 AND display_lines <= 100), -- % sọc màn hình

    -- Đánh giá tổng quan
    total_depreciation   NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (total_depreciation >= 0 AND total_depreciation <= 100), -- % khấu hao tổng
    overall_assessment   TEXT,                                               -- Nhận xét tổng quan về tình trạng máy
    
    -- Thông tin bổ sung
    status               VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'tested', 'cancelled')), -- trạng thái kiểm tra
    additional_notes     TEXT,                                               -- Ghi chú thêm từ nhân viên kiểm tra
    test_date            DATE NOT NULL DEFAULT ('now'::text)::date,          -- Ngày thực hiện kiểm tra (PostgreSQL 9.4 compatible)
    repair_recommendations TEXT,                                             -- Khuyến nghị sửa chữa (nếu có)
    estimated_repair_cost NUMERIC(12,2) CHECK (estimated_repair_cost >= 0), -- Chi phí sửa chữa ước tính
    
    -- Thông tin audit
    staff_id             UUID,                                               -- Nhân viên thực hiện kiểm tra
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),   -- Thời điểm tạo
    created_by           UUID,
    modified_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),   -- Thời điểm cập nhật
    modified_by          UUID,
    CONSTRAINT FK_product_diagnostics_product_item_id FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE CASCADE,
    CONSTRAINT FK_product_diagnostics_staff_id FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_diagnostics_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_diagnostics_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG MEDIA SẢN PHẨM (product_media): ảnh/video cho product
-- =========================================
CREATE TABLE product_media (
    id             UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    product_id     UUID,                                                 -- Media cấp product
    url            TEXT NOT NULL,                                        -- Link ảnh/video
    type           VARCHAR(10) NOT NULL DEFAULT 'image'                   -- Loại: image/video
                   CHECK (type IN ('image','video')),
    is_primary     BOOLEAN NOT NULL DEFAULT FALSE,                        -- Đặt ảnh chính
    sort_order     INTEGER NOT NULL DEFAULT 0,                             -- Thứ tự hiển thị
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by     UUID,
    modified_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by    UUID,
    CONSTRAINT FK_product_media_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT FK_product_media_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_media_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG GIỎ HÀNG (carts): giỏ của mỗi user
-- =========================================
CREATE TABLE carts (
    id         UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),     -- PK
    user_id    UUID NOT NULL,                                           -- Thuộc user; xóa user -> xóa giỏ
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),          -- Audit
    created_by UUID,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by UUID,
    CONSTRAINT FK_carts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_carts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_carts_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG DÒNG GIỎ HÀNG (cart_items): item trong giỏ
-- =========================================
CREATE TABLE cart_items (
    id            UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),  -- PK
    cart_id       UUID NOT NULL,                                        -- Thuộc giỏ
    product_item_id UUID NOT NULL,                                      -- Tham chiếu biến thể; RESTRICT để tránh mất tham chiếu
    qty           INTEGER NOT NULL CHECK (qty > 0),                      -- Số lượng
    unit_price    NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),       -- Đơn giá
    total_price   NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),      -- Tổng tiền (qty * unit_price)
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by    UUID,
    modified_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by   UUID,
    CONSTRAINT FK_cart_items_cart_id FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_product_item_id FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE RESTRICT,
    CONSTRAINT FK_cart_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_cart_items_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG ĐƠN HÀNG (orders): thông tin đơn & thanh toán
-- =========================================
CREATE TABLE orders (
    id                   UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    user_id              UUID NOT NULL,                                       -- Khách đặt; giữ lịch sử nên RESTRICT
    code                 VARCHAR(50) NOT NULL UNIQUE,                           -- Mã đơn duy nhất (human-friendly)
    status               VARCHAR(20) NOT NULL DEFAULT 'pending'                 -- Trạng thái luồng xử lý đơn
                         CHECK (status IN ('pending','paid','processing','shipped','completed','cancelled','refunded')),
    payment_method       VARCHAR(20) NOT NULL DEFAULT 'cod'                     -- Phương thức thanh toán
                         CHECK (payment_method IN ('cod','bank','e_wallet','card')), 
    payment_status       VARCHAR(20) NOT NULL DEFAULT 'unpaid'                  -- Trạng thái tiền
                         CHECK (payment_status IN ('unpaid','paid','refunded')),
    subtotal             NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),          -- Tạm tính (tổng dòng)
    shipping_fee         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0), -- Phí vận chuyển
    total                NUMERIC(12,2) NOT NULL CHECK (total >= 0),             -- Tổng thanh toán
    shipping_address_id  UUID,                                                 -- Địa chỉ giao (xóa -> NULL)
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by           UUID,
    modified_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by          UUID,
    CONSTRAINT FK_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT FK_orders_shipping_address_id FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    CONSTRAINT FK_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_orders_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG SẢN PHẨM TRONG ĐƠN (order_items): các dòng đơn
-- =========================================
CREATE TABLE order_items (
    id             UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),  -- PK
    order_id       UUID NOT NULL,                                        -- Thuộc đơn; xóa đơn -> xóa dòng
    product_item_id UUID NOT NULL,                                       -- Biến thể đã bán; RESTRICT để giữ lịch sử
    qty            INTEGER NOT NULL CHECK (qty > 0),                      -- Số lượng
    unit_price     NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),       -- Đơn giá
    total_price    NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),      -- Tổng tiền (qty * unit_price)
    warranty_until DATE,                                                  -- Ngày hết hạn bảo hành cho dòng này (nếu có)
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),      -- Audit
    created_by     UUID,
    modified_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by    UUID,
    CONSTRAINT FK_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_product_item_id FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE RESTRICT,
    CONSTRAINT FK_order_items_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_order_items_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG THU CŨ ĐỔI MỚI (tradeins): quy trình đánh giá & báo giá
-- =========================================
CREATE TABLE tradeins (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    user_id         UUID,                                                 -- Người yêu cầu; có thể NULL (khách vãng lai tạo sau)
    product_item_id UUID NOT NULL,                                       -- Biến thể được định giá
    product_diagnostic_id UUID,                                           -- Thông số tình trạng (có thể NULL ban đầu)
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'                -- Trạng thái quy trình trade-in
                     CHECK (status IN ('pending','inspecting','quoted','accepted','rejected','cancelled','completed')),
    quoted_price    NUMERIC(12,2) CHECK (quoted_price >= 0),             -- Giá báo sau thẩm định
    appointment_at  TIMESTAMP WITH TIME ZONE,                             -- Lịch hẹn thẩm định
    staff_id        UUID,                                                 -- Nhân viên phụ trách
    inspection_notes TEXT,                                                -- Ghi chú đánh giá
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),     -- Audit
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_tradeins_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_tradeins_product_item_id FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE RESTRICT,
    CONSTRAINT FK_tradeins_product_diagnostic_id FOREIGN KEY (product_diagnostic_id) REFERENCES product_diagnostics(id) ON DELETE SET NULL,
    CONSTRAINT FK_tradeins_staff_id FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_tradeins_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_tradeins_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- BẢNG ĐÁNH GIÁ SẢN PHẨM (product_ratings): rating và review sản phẩm
-- =========================================
CREATE TABLE product_ratings (
    id              UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(), -- PK
    product_id      UUID NOT NULL,                                       -- Sản phẩm được đánh giá
    user_id         UUID NOT NULL,                                       -- Người đánh giá
    order_item_id   UUID,                                                 -- Liên kết với đơn hàng (chỉ khách đã mua mới được đánh giá)
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Điểm tổng (1-5 sao)
    content         TEXT,                                                 -- Nội dung chi tiết
    -- Audit
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by      UUID,
    modified_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    modified_by     UUID,
    CONSTRAINT FK_product_ratings_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT FK_product_ratings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_product_ratings_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_ratings_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT FK_product_ratings_modified_by FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
);

