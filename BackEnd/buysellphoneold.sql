-- =============================================
-- SQL Server Database Schema for BuySellPhoneOld
-- =============================================

-- Create database if not exists (SQL Server syntax)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BuySellPhoneOld')
BEGIN
    CREATE DATABASE BuySellPhoneOld;
END
GO

-- Use the database
USE BuySellPhoneOld;
GO

-- Drop existing tables in correct order (respecting foreign key constraints)
IF OBJECT_ID('product_ratings', 'U') IS NOT NULL DROP TABLE product_ratings;
IF OBJECT_ID('tradeins', 'U') IS NOT NULL DROP TABLE tradeins;
IF OBJECT_ID('order_items', 'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('orders', 'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('cart_items', 'U') IS NOT NULL DROP TABLE cart_items;
IF OBJECT_ID('product_diagnostics', 'U') IS NOT NULL DROP TABLE product_diagnostics;
IF OBJECT_ID('product_media', 'U') IS NOT NULL DROP TABLE product_media;
IF OBJECT_ID('product_item_colors', 'U') IS NOT NULL DROP TABLE product_item_colors;
IF OBJECT_ID('product_item_models', 'U') IS NOT NULL DROP TABLE product_item_models;
IF OBJECT_ID('product_items', 'U') IS NOT NULL DROP TABLE product_items;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('product_colors', 'U') IS NOT NULL DROP TABLE product_colors;
IF OBJECT_ID('product_models', 'U') IS NOT NULL DROP TABLE product_models;
IF OBJECT_ID('addresses', 'U') IS NOT NULL DROP TABLE addresses;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('categories', 'U') IS NOT NULL DROP TABLE categories;
IF OBJECT_ID('brands', 'U') IS NOT NULL DROP TABLE brands;
IF OBJECT_ID('invalidate_token', 'U') IS NOT NULL DROP TABLE invalidate_token;
GO

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name NVARCHAR(100) NOT NULL,
    gender NVARCHAR(10) NULL CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    phone NVARCHAR(20) NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    roles NVARCHAR(MAX) NULL, -- Store as JSON string or comma-separated
    status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL
);
GO

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
GO

-- =============================================
-- 2. ADDRESSES TABLE
-- =============================================
CREATE TABLE addresses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    is_warehouse BIT NOT NULL DEFAULT 0,
    is_default BIT NOT NULL DEFAULT 0,
    phone NVARCHAR(20) NOT NULL,
    address_line NVARCHAR(500) NOT NULL,
    ward_name NVARCHAR(100) NOT NULL,
    ward_code NVARCHAR(100) NOT NULL,
    district_name NVARCHAR(100) NULL,
    district_code NVARCHAR(100) NULL,
    city_name NVARCHAR(100) NOT NULL,
    city_code NVARCHAR(100) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);
GO

-- =============================================
-- 3. BRANDS TABLE
-- =============================================
CREATE TABLE brands (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL UNIQUE,
    logo_url NVARCHAR(500) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL
);
GO

CREATE INDEX idx_brands_name ON brands(name);
GO

-- =============================================
-- 4. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL
);
GO

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_is_active ON categories(is_active);
GO

-- =============================================
-- 5. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    brand_id UNIQUEIDENTIFIER NOT NULL,
    category_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    warranty_months INT NOT NULL DEFAULT 0,
    status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);
GO

-- =============================================
-- 6. PRODUCT MODELS TABLE
-- =============================================
CREATE TABLE product_models (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    ram_gb INT NULL,
    rom_gb INT NOT NULL,
    grade NVARCHAR(1) NULL CHECK (grade IN ('A', 'B', 'C', 'D')),
    description NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL
);
GO

CREATE INDEX idx_product_models_name ON product_models(name);
CREATE INDEX idx_product_models_grade ON product_models(grade);
GO

-- =============================================
-- 7. PRODUCT COLORS TABLE
-- =============================================
CREATE TABLE product_colors (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(50) NOT NULL UNIQUE,
    hex_code NVARCHAR(7) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL
);
GO

CREATE INDEX idx_product_colors_name ON product_colors(name);
GO

-- =============================================
-- 8. PRODUCT ITEMS TABLE
-- =============================================
CREATE TABLE product_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id UNIQUEIDENTIFIER NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    sell_price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2) NULL,
    qty_available INT NOT NULL DEFAULT 1,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_product_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_product_items_product_id ON product_items(product_id);
CREATE INDEX idx_product_items_sell_price ON product_items(sell_price);
CREATE INDEX idx_product_items_qty_available ON product_items(qty_available);
GO

-- =============================================
-- 9. PRODUCT ITEM MODELS (Many-to-Many)
-- =============================================
CREATE TABLE product_item_models (
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    model_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (product_item_id, model_id),
    CONSTRAINT fk_product_item_models_item FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item_models_model FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_product_item_models_item ON product_item_models(product_item_id);
CREATE INDEX idx_product_item_models_model ON product_item_models(model_id);
GO

-- =============================================
-- 10. PRODUCT ITEM COLORS (Many-to-Many)
-- =============================================
CREATE TABLE product_item_colors (
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    color_id UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (product_item_id, color_id),
    CONSTRAINT fk_product_item_colors_item FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item_colors_color FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_product_item_colors_item ON product_item_colors(product_item_id);
CREATE INDEX idx_product_item_colors_color ON product_item_colors(color_id);
GO

-- =============================================
-- 11. PRODUCT MEDIA TABLE
-- =============================================
CREATE TABLE product_media (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id UNIQUEIDENTIFIER NULL,
    url NVARCHAR(500) NOT NULL,
    type NVARCHAR(10) NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
    is_primary BIT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_product_media_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_product_media_product_id ON product_media(product_id);
CREATE INDEX idx_product_media_is_primary ON product_media(is_primary);
CREATE INDEX idx_product_media_sort_order ON product_media(sort_order);
GO

-- =============================================
-- 12. PRODUCT DIAGNOSTICS TABLE
-- =============================================
CREATE TABLE product_diagnostics (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Audio & Camera
    microphone_damage BIT NULL,
    front_camera_damage BIT NULL,
    rear_camera_damage BIT NULL,
    
    -- Battery & Hardware
    battery_health DECIMAL(5, 2) NULL,
    charging_port_damage BIT NULL,
    speaker_damage BIT NULL,
    button_damage BIT NULL,
    wifi_bluetooth_issue BIT NULL,
    
    -- Screen
    screen_cracks DECIMAL(5, 2) NOT NULL DEFAULT 0,
    scratches DECIMAL(5, 2) NOT NULL DEFAULT 0,
    edge_dings DECIMAL(5, 2) NOT NULL DEFAULT 0,
    dents DECIMAL(5, 2) NOT NULL DEFAULT 0,
    display_failure DECIMAL(5, 2) NOT NULL DEFAULT 0,
    dead_pixels DECIMAL(5, 2) NOT NULL DEFAULT 0,
    display_lines DECIMAL(5, 2) NOT NULL DEFAULT 0,
    
    -- Overall
    total_depreciation DECIMAL(5, 2) NOT NULL DEFAULT 0,
    overall_assessment NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_product_diagnostics_item FOREIGN KEY (product_item_id) REFERENCES product_items(id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_product_diagnostics_item_id ON product_diagnostics(product_item_id);
CREATE INDEX idx_product_diagnostics_status ON product_diagnostics(status);
GO

-- =============================================
-- 13. CART ITEMS TABLE
-- =============================================
CREATE TABLE cart_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product_item FOREIGN KEY (product_item_id) REFERENCES product_items(id)
);
GO

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_item_id ON cart_items(product_item_id);
GO

-- =============================================
-- 14. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded')),
    payment_method NVARCHAR(20) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'bank_transfer', 'credit_card', 'e_wallet')),
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    shipping_address_id UNIQUEIDENTIFIER NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id)
);
GO

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_code ON orders(code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
GO

-- =============================================
-- 15. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_id UNIQUEIDENTIFIER NOT NULL,
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    qty INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    warranty_until DATE NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product_item FOREIGN KEY (product_item_id) REFERENCES product_items(id)
);
GO

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_item_id ON order_items(product_item_id);
GO

-- =============================================
-- 16. PRODUCT RATINGS TABLE
-- =============================================
CREATE TABLE product_ratings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    order_item_id UNIQUEIDENTIFIER NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_product_ratings_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_ratings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_product_ratings_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);
GO

CREATE INDEX idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX idx_product_ratings_user_id ON product_ratings(user_id);
CREATE INDEX idx_product_ratings_rating ON product_ratings(rating);
GO

-- =============================================
-- 17. TRADEINS TABLE
-- =============================================
CREATE TABLE tradeins (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NULL,
    product_item_id UNIQUEIDENTIFIER NOT NULL,
    product_diagnostic_id UNIQUEIDENTIFIER NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'completed', 'cancelled')),
    quoted_price DECIMAL(12, 2) NULL,
    appointment_at DATETIMEOFFSET NULL,
    staff_id UNIQUEIDENTIFIER NULL,
    inspection_notes NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_by UNIQUEIDENTIFIER NULL,
    CONSTRAINT fk_tradeins_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_tradeins_product_item FOREIGN KEY (product_item_id) REFERENCES product_items(id),
    CONSTRAINT fk_tradeins_product_diagnostic FOREIGN KEY (product_diagnostic_id) REFERENCES product_diagnostics(id),
    CONSTRAINT fk_tradeins_staff FOREIGN KEY (staff_id) REFERENCES users(id)
);
GO

CREATE INDEX idx_tradeins_user_id ON tradeins(user_id);
CREATE INDEX idx_tradeins_product_item_id ON tradeins(product_item_id);
CREATE INDEX idx_tradeins_status ON tradeins(status);
CREATE INDEX idx_tradeins_staff_id ON tradeins(staff_id);
GO

-- =============================================
-- 18. INVALIDATE TOKEN TABLE
-- =============================================
CREATE TABLE invalidate_token (
    id NVARCHAR(255) PRIMARY KEY,
    expiry_date DATETIME2 NOT NULL
);
GO

CREATE INDEX idx_invalidate_token_expiry_date ON invalidate_token(expiry_date);
GO

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample brands
INSERT INTO brands (id, name, logo_url) VALUES
(NEWID(), 'Apple', 'https://example.com/logos/apple.png'),
(NEWID(), 'Samsung', 'https://example.com/logos/samsung.png'),
(NEWID(), 'Xiaomi', 'https://example.com/logos/xiaomi.png'),
(NEWID(), 'OPPO', 'https://example.com/logos/oppo.png'),
(NEWID(), 'Vivo', 'https://example.com/logos/vivo.png');
GO

-- Insert sample categories
INSERT INTO categories (id, name, description, is_active) VALUES
(NEWID(), 'Smartphone', N'Điện thoại thông minh', 1),
(NEWID(), 'Tablet', N'Máy tính bảng', 1),
(NEWID(), 'Laptop', N'Máy tính xách tay', 1),
(NEWID(), 'Smartwatch', N'Đồng hồ thông minh', 1),
(NEWID(), 'Accessories', N'Phụ kiện', 1);
GO

-- Insert sample colors
INSERT INTO product_colors (id, name, hex_code) VALUES
(NEWID(), 'Black', '#000000'),
(NEWID(), 'White', '#FFFFFF'),
(NEWID(), 'Gold', '#FFD700'),
(NEWID(), 'Silver', '#C0C0C0'),
(NEWID(), 'Blue', '#0000FF'),
(NEWID(), 'Red', '#FF0000'),
(NEWID(), 'Green', '#00FF00'),
(NEWID(), 'Purple', '#800080'),
(NEWID(), 'Pink', '#FFC0CB');
GO

-- Insert sample product models
INSERT INTO product_models (id, name, ram_gb, rom_gb, grade, description) VALUES
(NEWID(), '64GB', NULL, 64, 'A', N'Phiên bản 64GB - Hàng Like New'),
(NEWID(), '128GB', NULL, 128, 'A', N'Phiên bản 128GB - Hàng Like New'),
(NEWID(), '256GB', NULL, 256, 'A', N'Phiên bản 256GB - Hàng Like New'),
(NEWID(), '512GB', NULL, 512, 'A', N'Phiên bản 512GB - Hàng Like New'),
(NEWID(), '1TB', NULL, 1024, 'A', N'Phiên bản 1TB - Hàng Like New'),
(NEWID(), '64GB Grade B', NULL, 64, 'B', N'Phiên bản 64GB - Hàng cũ đẹp'),
(NEWID(), '128GB Grade B', NULL, 128, 'B', N'Phiên bản 128GB - Hàng cũ đẹp'),
(NEWID(), '256GB Grade B', NULL, 256, 'B', N'Phiên bản 256GB - Hàng cũ đẹp');
GO

PRINT 'Database schema created successfully!';
GO