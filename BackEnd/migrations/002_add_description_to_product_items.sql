-- Migration: Add description column to product_items table
-- Date: 2026-01-11
-- Description: Thêm cột description (TEXT) vào bảng product_items

-- Add description column
ALTER TABLE product_items 
ADD COLUMN description TEXT;

-- Add comment to column
COMMENT ON COLUMN product_items.description IS 'Mô tả chi tiết cho biến thể sản phẩm';
