-- Migration: Move qty_available from product_items to product_colors
-- Date: 2026-01-09
-- Description: Chuyển trường số lượng (qty_available) từ product_items sang product_colors
--              để quản lý số lượng chính xác hơn theo từng màu sắc của từng biến thể

-- =============================================
-- Step 1: Add product_model_id to product_colors
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'product_colors') AND name = 'product_model_id')
BEGIN
    ALTER TABLE product_colors
    ADD product_model_id UNIQUEIDENTIFIER NOT NULL;
    
    ALTER TABLE product_colors
    ADD CONSTRAINT fk_product_colors_model 
    FOREIGN KEY (product_model_id) REFERENCES product_models(id) ON DELETE CASCADE;
    
    CREATE INDEX idx_product_colors_model ON product_colors(product_model_id);
END
GO

-- =============================================
-- Step 2: Add qty_available to product_colors
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'product_colors') AND name = 'qty_available')
BEGIN
    ALTER TABLE product_colors
    ADD qty_available INT NOT NULL DEFAULT 0;
END
GO

-- =============================================
-- Step 3: Remove UNIQUE constraint from product_colors.name
-- =============================================
IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'product_colors') AND name LIKE 'UQ_%name%')
BEGIN
    DECLARE @ConstraintName NVARCHAR(200);
    SELECT @ConstraintName = name 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'product_colors') AND name LIKE 'UQ_%name%';
    
    DECLARE @SQL NVARCHAR(MAX) = 'ALTER TABLE product_colors DROP CONSTRAINT ' + @ConstraintName;
    EXEC sp_executesql @SQL;
END
GO

-- =============================================
-- Step 4: Drop qty_available index and column from product_items
-- =============================================
IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'product_items') AND name = 'idx_product_items_qty_available')
BEGIN
    DROP INDEX idx_product_items_qty_available ON product_items;
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'product_items') AND name = 'qty_available')
BEGIN
    ALTER TABLE product_items
    DROP COLUMN qty_available;
END
GO

-- =============================================
-- Step 5: Drop old many-to-many tables (if they exist)
-- =============================================
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'product_item_colors')
BEGIN
    DROP TABLE product_item_colors;
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'product_item_models')
BEGIN
    DROP TABLE product_item_models;
END
GO

PRINT 'Migration completed successfully!';
PRINT 'qty_available moved from product_items to product_colors';
GO
