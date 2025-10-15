CREATE TABLE users (
    id             VARCHAR(100) PRIMARY KEY,
    full_name      VARCHAR(100),
    gender         VARCHAR(10),
    birth_date     DATE,
    email          VARCHAR(100),
    phone          VARCHAR(20),
    password       TEXT,
    role           VARCHAR(20),
    status         VARCHAR(20),
    created_at     TIMESTAMPTZ,
    created_by     BIGINT REFERENCES users(id),
    modified_at    TIMESTAMPTZ,
    modified_by    BIGINT REFERENCES users(id)
);

CREATE TABLE addresses (
    id              VARCHAR(100) PRIMARY KEY,
    user_id         VARCHAR(100) REFERENCES users(id),
    full_name       VARCHAR(100),
    is_warehouse    BOOLEAN,
    is_default      BOOLEAN,
    phone           VARCHAR(20),
    address_line    TEXT,
    ward_name       VARCHAR(100),
    ward_code       VARCHAR(100),
    district_name   VARCHAR(100),
    district_code   VARCHAR(100),
    city_name       VARCHAR(100),
    city_code       VARCHAR(100),
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE categories (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(100),
    description     TEXT,
    is_active       BOOLEAN,
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE brands (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(100),
    logo_url        TEXT,
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE product_colors (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(50),
    hex_code        VARCHAR(7),
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE products (
    id               BIGINT PRIMARY KEY,
    brand_id         BIGINT REFERENCES brands(id),
    category_id      BIGINT REFERENCES categories(id),
    name             VARCHAR(200),
    description      TEXT,
    warranty_months  INTEGER,
    status           VARCHAR(20),
    created_at       TIMESTAMPTZ,
    created_by       BIGINT REFERENCES users(id),
    modified_at      TIMESTAMPTZ,
    modified_by      BIGINT REFERENCES users(id)
);

CREATE TABLE product_models (
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(100),
    ram_gb          INTEGER,
    rom_gb          INTEGER,
    grade           VARCHAR(10),
    description     TEXT,
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE product_items (
    id               BIGINT PRIMARY KEY,
    product_id       BIGINT REFERENCES products(id),
    model_id         BIGINT REFERENCES product_models(id),
    color_id         BIGINT REFERENCES product_colors(id),
    base_price       NUMERIC(12,2),
    sell_price       NUMERIC(12,2),
    compare_price    NUMERIC(12,2),
    qty_available    INTEGER,
    created_at       TIMESTAMPTZ,
    created_by       BIGINT REFERENCES users(id),
    modified_at      TIMESTAMPTZ,
    modified_by      BIGINT REFERENCES users(id)
);

CREATE TABLE product_diagnostics (
    id                   BIGINT PRIMARY KEY,
    product_item_id      BIGINT REFERENCES product_items(id),
    microphone_damage    BOOLEAN,
    front_camera_damage  BOOLEAN,
    rear_camera_damage   BOOLEAN,
    battery_health       NUMERIC(5,2),
    charging_port_damage BOOLEAN,
    speaker_damage       BOOLEAN,
    button_damage        BOOLEAN,
    wifi_bluetooth_issue BOOLEAN,
    screen_cracks        NUMERIC(5,2),
    scratches            NUMERIC(5,2),
    edge_dings           NUMERIC(5,2),
    dents                NUMERIC(5,2),
    display_failure      NUMERIC(5,2),
    dead_pixels          NUMERIC(5,2),
    display_lines        NUMERIC(5,2),
    total_depreciation   NUMERIC(5,2),
    overall_assessment   TEXT,
    status               VARCHAR(20),
    additional_notes     TEXT,
    test_date            DATE,
    repair_recommendations TEXT,
    estimated_repair_cost NUMERIC(12,2),
    staff_id             BIGINT REFERENCES users(id),
    created_at           TIMESTAMPTZ,
    created_by           BIGINT REFERENCES users(id),
    modified_at          TIMESTAMPTZ,
    modified_by          BIGINT REFERENCES users(id)
);

CREATE TABLE product_media (
    id             BIGINT PRIMARY KEY,
    product_id     BIGINT REFERENCES products(id),
    url            TEXT,
    type           VARCHAR(10),
    is_primary     BOOLEAN,
    sort_order     INTEGER,
    created_at     TIMESTAMPTZ,
    created_by     BIGINT REFERENCES users(id),
    modified_at    TIMESTAMPTZ,
    modified_by    BIGINT REFERENCES users(id)
);

CREATE TABLE carts (
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ,
    created_by BIGINT REFERENCES users(id),
    modified_at TIMESTAMPTZ,
    modified_by BIGINT REFERENCES users(id)
);

CREATE TABLE cart_items (
    id            BIGINT PRIMARY KEY,
    cart_id       BIGINT REFERENCES carts(id),
    product_item_id BIGINT REFERENCES product_items(id),
    qty           INTEGER,
    unit_price    NUMERIC(12,2),
    total_price   NUMERIC(12,2),
    created_at    TIMESTAMPTZ,
    created_by    BIGINT REFERENCES users(id),
    modified_at   TIMESTAMPTZ,
    modified_by   BIGINT REFERENCES users(id)
);

CREATE TABLE orders (
    id                   BIGINT PRIMARY KEY,
    user_id              BIGINT REFERENCES users(id),
    code                 VARCHAR(50),
    status               VARCHAR(20),
    payment_method       VARCHAR(20),
    payment_status       VARCHAR(20),
    subtotal             NUMERIC(12,2),
    shipping_fee         NUMERIC(12,2),
    total                NUMERIC(12,2),
    shipping_address_id  BIGINT REFERENCES addresses(id),
    created_at           TIMESTAMPTZ,
    created_by           BIGINT REFERENCES users(id),
    modified_at          TIMESTAMPTZ,
    modified_by          BIGINT REFERENCES users(id)
);

CREATE TABLE order_items (
    id             BIGINT PRIMARY KEY,
    order_id       BIGINT REFERENCES orders(id),
    product_item_id BIGINT REFERENCES product_items(id),
    qty            INTEGER,
    unit_price     NUMERIC(12,2),
    total_price    NUMERIC(12,2),
    warranty_until DATE,
    created_at     TIMESTAMPTZ,
    created_by     BIGINT REFERENCES users(id),
    modified_at    TIMESTAMPTZ,
    modified_by    BIGINT REFERENCES users(id)
);

CREATE TABLE tradeins (
    id              BIGINT PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    product_item_id BIGINT REFERENCES product_items(id),
    product_diagnostic_id BIGINT REFERENCES product_diagnostics(id),
    status          VARCHAR(20),
    quoted_price    NUMERIC(12,2),
    appointment_at  TIMESTAMPTZ,
    staff_id        BIGINT REFERENCES users(id),
    inspection_notes TEXT,
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);

CREATE TABLE product_ratings (
    id              BIGINT PRIMARY KEY,
    product_id      BIGINT REFERENCES products(id),
    user_id         BIGINT REFERENCES users(id),
    order_item_id   BIGINT REFERENCES order_items(id),
    rating          INTEGER,
    content         TEXT,
    created_at      TIMESTAMPTZ,
    created_by      BIGINT REFERENCES users(id),
    modified_at     TIMESTAMPTZ,
    modified_by     BIGINT REFERENCES users(id)
);
