-- =====================================================
-- FAKE DATA FOR BUYSELLPHONEOLD DATABASE
-- PostgreSQL Compatible
-- =====================================================

-- =====================================================
-- 1. PERMISSIONS (3 records)
-- =====================================================
INSERT INTO permission (name, description, created_at) VALUES
('READ_PRODUCT', 'Quyền xem sản phẩm', NOW()),
('WRITE_PRODUCT', 'Quyền thêm/sửa sản phẩm', NOW()),
('DELETE_PRODUCT', 'Quyền xóa sản phẩm', NOW()),
('MANAGE_ORDER', 'Quyền quản lý đơn hàng', NOW()),
('MANAGE_USER', 'Quyền quản lý người dùng', NOW());

-- =====================================================
-- 2. ROLES (3 records)
-- =====================================================
INSERT INTO role (name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống'),
('STAFF', 'Nhân viên cửa hàng'),
('USER', 'Khách hàng');

-- Role - Permission mapping
INSERT INTO role_permissions (role_name, permissions_name) VALUES
('ADMIN', 'READ_PRODUCT'),
('ADMIN', 'WRITE_PRODUCT'),
('ADMIN', 'DELETE_PRODUCT'),
('ADMIN', 'MANAGE_ORDER'),
('ADMIN', 'MANAGE_USER'),
('STAFF', 'READ_PRODUCT'),
('STAFF', 'WRITE_PRODUCT'),
('STAFF', 'MANAGE_ORDER'),
('USER', 'READ_PRODUCT');

-- =====================================================
-- 3. USERS (5 records)
-- Password: 123456 (BCrypt encoded)
-- =====================================================
INSERT INTO users (id, full_name, gender, birth_date, email, phone, password, status, created_at, modified_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Nguyễn Văn Admin', 'male', '1990-01-15', 'admin@buysellphone.com', '0901111111', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS9/UQDqr1rp4XXHK', 'active', NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', 'Trần Thị Staff', 'female', '1995-05-20', 'staff@buysellphone.com', '0902222222', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS9/UQDqr1rp4XXHK', 'active', NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', 'Lê Văn Khách', 'male', '1998-08-10', 'customer1@gmail.com', '0903333333', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS9/UQDqr1rp4XXHK', 'active', NOW(), NOW()),
('a4444444-4444-4444-4444-444444444444', 'Phạm Thị Hoa', 'female', '2000-12-25', 'customer2@gmail.com', '0904444444', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS9/UQDqr1rp4XXHK', 'active', NOW(), NOW()),
('a5555555-5555-5555-5555-555555555555', 'Hoàng Minh Tuấn', 'male', '1992-03-08', 'customer3@gmail.com', '0905555555', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS9/UQDqr1rp4XXHK', 'active', NOW(), NOW());

-- User - Role mapping
INSERT INTO users_roles (user_id, roles_name) VALUES
('a1111111-1111-1111-1111-111111111111', 'ADMIN'),
('a2222222-2222-2222-2222-222222222222', 'STAFF'),
('a3333333-3333-3333-3333-333333333333', 'USER'),
('a4444444-4444-4444-4444-444444444444', 'USER'),
('a5555555-5555-5555-5555-555555555555', 'USER');

-- =====================================================
-- 4. ADDRESSES (5 records)
-- =====================================================
INSERT INTO addresses (id, user_id, full_name, is_warehouse, is_default, phone, address_line, ward_name, ward_code, district_name, district_code, city_name, city_code) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Kho hàng chính', true, true, '0901111111', '123 Nguyễn Huệ', 'Phường Bến Nghé', '26734', 'Quận 1', '760', 'TP. Hồ Chí Minh', '79'),
('b2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'Lê Văn Khách', false, true, '0903333333', '456 Lê Lợi', 'Phường Bến Thành', '26737', 'Quận 1', '760', 'TP. Hồ Chí Minh', '79'),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Lê Văn Khách - Văn phòng', false, false, '0903333333', '789 Trần Hưng Đạo', 'Phường Cầu Ông Lãnh', '26740', 'Quận 1', '760', 'TP. Hồ Chí Minh', '79'),
('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Phạm Thị Hoa', false, true, '0904444444', '321 Hai Bà Trưng', 'Phường Tân Định', '26743', 'Quận 1', '760', 'TP. Hồ Chí Minh', '79'),
('b5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'Hoàng Minh Tuấn', false, true, '0905555555', '654 Điện Biên Phủ', 'Phường 25', '27136', 'Quận Bình Thạnh', '765', 'TP. Hồ Chí Minh', '79');

-- =====================================================
-- 5. BRANDS (5 records)
-- =====================================================
INSERT INTO brands (id, name, logo_url, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Apple', 'https://res.cloudinary.com/demo/image/upload/apple-logo.png', NOW()),
('c2222222-2222-2222-2222-222222222222', 'Samsung', 'https://res.cloudinary.com/demo/image/upload/samsung-logo.png', NOW()),
('c3333333-3333-3333-3333-333333333333', 'Xiaomi', 'https://res.cloudinary.com/demo/image/upload/xiaomi-logo.png', NOW()),
('c4444444-4444-4444-4444-444444444444', 'OPPO', 'https://res.cloudinary.com/demo/image/upload/oppo-logo.png', NOW()),
('c5555555-5555-5555-5555-555555555555', 'Vivo', 'https://res.cloudinary.com/demo/image/upload/vivo-logo.png', NOW());

-- =====================================================
-- 6. CATEGORIES (4 records)
-- =====================================================
INSERT INTO categories (id, name, description, image, is_active, created_at, modified_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'Điện thoại cũ', 'Điện thoại đã qua sử dụng, được kiểm tra chất lượng', 'https://res.cloudinary.com/demo/image/upload/phone-old.png', true, NOW(), NOW()),
('d2222222-2222-2222-2222-222222222222', 'Điện thoại mới', 'Điện thoại mới 100%, nguyên seal', 'https://res.cloudinary.com/demo/image/upload/phone-new.png', true, NOW(), NOW()),
('d3333333-3333-3333-3333-333333333333', 'Phụ kiện', 'Phụ kiện điện thoại các loại', 'https://res.cloudinary.com/demo/image/upload/accessories.png', true, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444444', 'Tablet', 'Máy tính bảng các hãng', 'https://res.cloudinary.com/demo/image/upload/tablet.png', true, NOW(), NOW());

-- =====================================================
-- 7. PRODUCTS (5 records)
-- =====================================================
INSERT INTO products (id, brand_id, category_id, name, description, warranty_months, status, created_at, modified_at) VALUES
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'iPhone 14 Pro Max', 'iPhone 14 Pro Max - Chip A16 Bionic, Dynamic Island, Camera 48MP', 12, 'active', NOW(), NOW()),
('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'iPhone 13', 'iPhone 13 - Chip A15 Bionic, Camera kép 12MP', 12, 'active', NOW(), NOW()),
('e3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23 Ultra - Snapdragon 8 Gen 2, S Pen, Camera 200MP', 12, 'active', NOW(), NOW()),
('e4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'Xiaomi 14 Ultra', 'Xiaomi 14 Ultra - Snapdragon 8 Gen 3, Camera Leica', 18, 'active', NOW(), NOW()),
('e5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'OPPO Find X7 Ultra', 'OPPO Find X7 Ultra - Dimensity 9300, Camera Hasselblad', 18, 'active', NOW(), NOW());

-- =====================================================
-- 8. PRODUCT_ITEMS (5 records)
-- =====================================================
INSERT INTO product_items (id, product_id, base_price, sell_price, compare_price, qty_available, created_at, modified_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 28000000.00, 25990000.00, 32990000.00, 10, NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 26000000.00, 23990000.00, 28990000.00, 5, NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 18000000.00, 15990000.00, 20990000.00, 8, NOW(), NOW()),
('f4444444-4444-4444-4444-444444444444', 'e3333333-3333-3333-3333-333333333333', 32000000.00, 29990000.00, 35990000.00, 3, NOW(), NOW()),
('f5555555-5555-5555-5555-555555555555', 'e4444444-4444-4444-4444-444444444444', 25000000.00, 23490000.00, 27990000.00, 15, NOW(), NOW());

-- =====================================================
-- 9. PRODUCT_MODELS (5 records)
-- =====================================================
INSERT INTO product_models (id, product_item_id, name, ram_gb, rom_gb, grade, description, created_at) VALUES
('g1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '256GB - Like New', 6, 256, 'A', 'Máy đẹp 99%, không trầy xước', NOW()),
('g2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', '512GB - Like New', 6, 512, 'A', 'Máy đẹp 99%, không trầy xước', NOW()),
('g3333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', '128GB - Good', 6, 128, 'B', 'Máy đẹp 95%, có vài vết trầy nhẹ', NOW()),
('g4444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333333', '256GB - Like New', 4, 256, 'A', 'Máy đẹp 99%', NOW()),
('g5555555-5555-5555-5555-555555555555', 'f4444444-4444-4444-4444-444444444444', '512GB - Like New', 12, 512, 'A', 'Máy đẹp 99%, fullbox', NOW());

INSERT INTO product_models (id, product_item_id, name, ram_gb, rom_gb, grade, description, created_at) VALUES
(gen_random_uuid(), 'f1111111-1111-1111-1111-111111111111', '256GB - Like New', 6, 256, 'A', 'Máy đẹp 99%, không trầy xước', NOW()),
(gen_random_uuid(), 'f1111111-1111-1111-1111-111111111111', '512GB - Like New', 6, 512, 'A', 'Máy đẹp 99%, không trầy xước', NOW()),
(gen_random_uuid(), 'f2222222-2222-2222-2222-222222222222', '128GB - Good', 6, 128, 'B', 'Máy đẹp 95%, có vài vết trầy nhẹ', NOW()),
(gen_random_uuid(), 'f3333333-3333-3333-3333-333333333333', '256GB - Like New', 4, 256, 'A', 'Máy đẹp 99%', NOW()),
(gen_random_uuid(), 'f4444444-4444-4444-4444-444444444444', '512GB - Like New', 12, 512, 'A', 'Máy đẹp 99%, fullbox', NOW());

-- =====================================================
-- 10. PRODUCT_COLORS (5 records)
-- =====================================================
INSERT INTO product_colors (id, product_model_id, name, hex_code, created_at) VALUES
('h1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'Deep Purple', '#5E35B1', NOW()),
('h2222222-2222-2222-2222-222222222222', 'g1111111-1111-1111-1111-111111111111', 'Gold', '#FFD700', NOW()),
('h3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'Space Black', '#1C1C1E', NOW()),
('h4444444-4444-4444-4444-444444444444', 'g3333333-3333-3333-3333-333333333333', 'Silver', '#C0C0C0', NOW()),
('h5555555-5555-5555-5555-555555555555', 'g4444444-4444-4444-4444-444444444444', 'Midnight', '#1C1C1E', NOW());

INSERT INTO product_colors (id, product_model_id, name, hex_code, created_at) VALUES
(gen_random_uuid(), '01803a46-b22f-4f64-a570-69e1c73b0e09', 'Deep Purple', '#5E35B1', NOW()),
(gen_random_uuid(), '0470bae7-be2a-41d1-8bd3-80f9ef0a6c0e', 'Gold', '#FFD700', NOW()),
(gen_random_uuid(), '08af264c-056e-4833-98af-4033fd596a68', 'Space Black', '#1C1C1E', NOW()),
(gen_random_uuid(), '2eb6d7cd-2fe1-4d44-8ef4-f2c0134d38db', 'Silver', '#C0C0C0', NOW()),
(gen_random_uuid(), '4390a576-f6e5-4fd9-834c-f752860a06e8', 'Midnight', '#1C1C1E', NOW());


-- =====================================================
-- 11. PRODUCT_MEDIA (5 records)
-- =====================================================
INSERT INTO product_media (id, product_item_id, url, public_id, type, is_primary, sort_order, created_at) VALUES
('i1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-1.jpg', 'iphone14promax-1', 'image', true, 0, NOW()),
('i2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-2.jpg', 'iphone14promax-2', 'image', false, 1, NOW()),
('i3333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-gold.jpg', 'iphone14promax-gold', 'image', true, 0, NOW()),
('i4444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333333', 'https://res.cloudinary.com/demo/image/upload/iphone13-1.jpg', 'iphone13-1', 'image', true, 0, NOW()),
('i5555555-5555-5555-5555-555555555555', 'f4444444-4444-4444-4444-444444444444', 'https://res.cloudinary.com/demo/image/upload/s23ultra-1.jpg', 's23ultra-1', 'image', true, 0, NOW());


INSERT INTO product_media (id, product_item_id, url, public_id, type, is_primary, sort_order, created_at) VALUES
(gen_random_uuid(), 'f1111111-1111-1111-1111-111111111111', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-1.jpg', 'iphone14promax-1', 'image', true, 0, NOW()),
(gen_random_uuid(), 'f1111111-1111-1111-1111-111111111111', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-2.jpg', 'iphone14promax-2', 'image', false, 1, NOW()),
(gen_random_uuid(), 'f2222222-2222-2222-2222-222222222222', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-gold.jpg', 'iphone14promax-gold', 'image', true, 0, NOW()),
(gen_random_uuid(), 'f3333333-3333-3333-3333-333333333333', 'https://res.cloudinary.com/demo/image/upload/iphone13-1.jpg', 'iphone13-1', 'image', true, 0, NOW()),
(gen_random_uuid(), 'f4444444-4444-4444-4444-444444444444', 'https://res.cloudinary.com/demo/image/upload/s23ultra-1.jpg', 's23ultra-1', 'image', true, 0, NOW());

-- =====================================================
-- 12. PRODUCT_RATINGS (5 records)
-- =====================================================
INSERT INTO product_ratings (id, product_id, user_id, order_id, rating, content, created_at) VALUES
('j1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', NULL, 5, 'Máy đẹp như mới, giao hàng nhanh, rất hài lòng!', NOW()),
('j2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', NULL, 4, 'Máy chất lượng tốt, pin trâu', NOW()),
('j3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', NULL, 5, 'iPhone 13 xài ngon lắm, đáng tiền', NOW()),
('j4444444-4444-4444-4444-444444444444', 'e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', NULL, 4, 'Samsung S23 Ultra camera đẹp, màn hình sắc nét', NOW()),
('j5555555-5555-5555-5555-555555555555', 'e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', NULL, 5, 'Xiaomi 14 Ultra xứng đáng flagship killer', NOW());

-- =====================================================
-- 13. ORDERS (4 records)
-- =====================================================
INSERT INTO orders (id, user_id, code, status, payment_method, payment_status, subtotal, shipping_fee, total, shipping_address_id, snapshot_shipping_full_name, snapshot_shipping_phone, snapshot_address, created_at, modified_at) VALUES
('k1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'ORD-20260105-001', 'delivered', 'cod', 'paid', 25990000.00, 30000.00, 26020000.00, 'b2222222-2222-2222-2222-222222222222', 'Lê Văn Khách', '0903333333', '456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', NOW() - INTERVAL '10 days', NOW()),
('k2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'ORD-20260105-002', 'confirmed', 'banking', 'paid', 15990000.00, 0.00, 15990000.00, 'b4444444-4444-4444-4444-444444444444', 'Phạm Thị Hoa', '0904444444', '321 Hai Bà Trưng, Phường Tân Định, Quận 1, TP. Hồ Chí Minh', NOW() - INTERVAL '5 days', NOW()),
('k3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'ORD-20260105-003', 'pending', 'cod', 'unpaid', 29990000.00, 50000.00, 30040000.00, 'b5555555-5555-5555-5555-555555555555', 'Hoàng Minh Tuấn', '0905555555', '654 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh', NOW() - INTERVAL '1 day', NOW()),
('k4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'ORD-20260105-004', 'shipping', 'banking', 'paid', 23490000.00, 30000.00, 23520000.00, 'b3333333-3333-3333-3333-333333333333', 'Lê Văn Khách - Văn phòng', '0903333333', '789 Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, TP. Hồ Chí Minh', NOW() - INTERVAL '2 days', NOW());

-- =====================================================
-- 14. ORDER_ITEMS (5 records)
-- =====================================================
INSERT INTO order_items (id, order_id, product_item_id, snapshot_product_name, snapshot_product_model, snapshot_product_color, snapshot_product_media_url, qty, unit_price, total_price, warranty_until, created_at) VALUES
('l1111111-1111-1111-1111-111111111111', 'k1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'iPhone 14 Pro Max', '256GB - Like New', 'Deep Purple', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-1.jpg', 1, 25990000.00, 25990000.00, '2027-01-05', NOW() - INTERVAL '10 days'),
('l2222222-2222-2222-2222-222222222222', 'k2222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333', 'iPhone 13', '256GB - Like New', 'Midnight', 'https://res.cloudinary.com/demo/image/upload/iphone13-1.jpg', 1, 15990000.00, 15990000.00, '2027-01-05', NOW() - INTERVAL '5 days'),
('l3333333-3333-3333-3333-333333333333', 'k3333333-3333-3333-3333-333333333333', 'f4444444-4444-4444-4444-444444444444', 'Samsung Galaxy S23 Ultra', '512GB - Like New', 'Phantom Black', 'https://res.cloudinary.com/demo/image/upload/s23ultra-1.jpg', 1, 29990000.00, 29990000.00, '2027-01-05', NOW() - INTERVAL '1 day'),
('l4444444-4444-4444-4444-444444444444', 'k4444444-4444-4444-4444-444444444444', 'f5555555-5555-5555-5555-555555555555', 'Xiaomi 14 Ultra', '512GB - New', 'Black', 'https://res.cloudinary.com/demo/image/upload/xiaomi14ultra-1.jpg', 1, 23490000.00, 23490000.00, '2027-07-05', NOW() - INTERVAL '2 days'),
('l5555555-5555-5555-5555-555555555555', 'k1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', 'iPhone 14 Pro Max', '128GB - Good', 'Gold', 'https://res.cloudinary.com/demo/image/upload/iphone14promax-gold.jpg', 1, 23990000.00, 23990000.00, '2027-01-05', NOW() - INTERVAL '10 days');

-- =====================================================
-- 15. CART_ITEMS (4 records)
-- =====================================================
INSERT INTO cart_items (id, user_id, product_item_id, qty, unit_price, total_price, created_at) VALUES
('m1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'f5555555-5555-5555-5555-555555555555', 1, 23490000.00, 23490000.00, NOW()),
('m2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'f1111111-1111-1111-1111-111111111111', 2, 25990000.00, 51980000.00, NOW()),
('m3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'f3333333-3333-3333-3333-333333333333', 1, 15990000.00, 15990000.00, NOW()),
('m4444444-4444-4444-4444-444444444444', 'a5555555-5555-5555-5555-555555555555', 'f4444444-4444-4444-4444-444444444444', 1, 29990000.00, 29990000.00, NOW());

-- =====================================================
-- 16. PRODUCT_DIAGNOSTICS (3 records)
-- =====================================================
INSERT INTO product_diagnostics (id, product_item_id, microphone_damage, front_camera_damage, rear_camera_damage, battery_health, charging_port_damage, speaker_damage, button_damage, wifi_bluetooth_issue, screen_cracks, scratches, edge_dings, dents, display_failure, dead_pixels, display_lines, total_depreciation, overall_assessment, created_at, modified_at) VALUES
('n1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', false, false, false, 95.50, false, false, false, false, 0.00, 2.00, 1.00, 0.00, 0.00, 0.00, 0.00, 3.00, 'Máy đẹp 97%, hoạt động hoàn hảo', NOW(), NOW()),
('n2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', false, false, false, 88.00, false, false, false, false, 0.00, 5.00, 3.00, 0.00, 0.00, 0.00, 0.00, 8.00, 'Máy đẹp 92%, có vài vết trầy nhẹ', NOW(), NOW()),
('n3333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', false, false, false, 92.00, false, false, false, false, 0.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00, 'Máy đẹp 99%, gần như mới', NOW(), NOW());

-- =====================================================
-- 17. TRADEINS (3 records)
-- =====================================================
INSERT INTO tradeins (id, user_id, product_item_id, product_diagnostic_id, status, quoted_price, appointment_at, staff_id, inspection_notes, created_at, modified_at) VALUES
('o1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', 'n1111111-1111-1111-1111-111111111111', 'approved', 20000000.00, NOW() + INTERVAL '2 days', 'a2222222-2222-2222-2222-222222222222', 'Máy đẹp, đã kiểm tra đầy đủ chức năng', NOW() - INTERVAL '3 days', NOW()),
('o2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'f2222222-2222-2222-2222-222222222222', 'n2222222-2222-2222-2222-222222222222', 'pending', 18000000.00, NOW() + INTERVAL '5 days', NULL, NULL, NOW() - INTERVAL '1 day', NOW()),
('o3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'f3333333-3333-3333-3333-333333333333', 'n3333333-3333-3333-3333-333333333333', 'completed', 12000000.00, NOW() - INTERVAL '5 days', 'a2222222-2222-2222-2222-222222222222', 'Đã hoàn tất thu mua, thanh toán cho khách', NOW() - INTERVAL '7 days', NOW());

-- =====================================================
-- END OF FAKE DATA
-- =====================================================
