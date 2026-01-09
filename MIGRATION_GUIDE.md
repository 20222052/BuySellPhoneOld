# Migration Guide: Move qty_available from ProductItem to ProductColor

## Tổng quan
Migration này chuyển trường `qty_available` (số lượng) từ bảng `product_items` sang bảng `product_colors`. Điều này giúp quản lý số lượng chính xác hơn ở mức độ màu sắc của từng biến thể sản phẩm.

## Lý do thay đổi
- **Trước đây**: Số lượng được lưu ở ProductItem level → Không thể phân biệt số lượng theo từng màu
- **Bây giờ**: Số lượng được lưu ở ProductColor level → Quản lý chính xác số lượng từng màu của từng model

## Các thay đổi đã thực hiện

### 1. Backend - Database Schema
**File**: `BackEnd/migrations/001_move_qty_to_product_colors.sql`

Các thay đổi:
- ✅ Thêm cột `product_model_id` vào bảng `product_colors`
- ✅ Thêm cột `qty_available` vào bảng `product_colors`
- ✅ Xóa constraint UNIQUE từ `product_colors.name`
- ✅ Xóa cột `qty_available` từ bảng `product_items`
- ✅ Xóa các bảng many-to-many cũ (`product_item_colors`, `product_item_models`)

### 2. Backend - Entities
**File**: `BackEnd/src/main/java/com/eaut/backend/entities/ProductColor.java`
- ✅ Đã có trường `qtyAvailable` (kiểu `int`)

**File**: `BackEnd/src/main/java/com/eaut/backend/entities/ProductItem.java`
- ✅ Không còn trường `qtyAvailable`

### 3. Backend - DTOs
**File**: `BackEnd/src/main/java/com/eaut/backend/model/request/ProductColorRequest.java`
- ✅ Thêm `qtyAvailable` (Integer)

**File**: `BackEnd/src/main/java/com/eaut/backend/model/response/ProductColorResponse.java`
- ✅ Thêm `qtyAvailable` (Integer)

**File**: `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemResponse.java`
- ✅ Xóa `qtyAvailable`

**File**: `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemListResponse.java`
- ✅ Giữ `qtyAvailable` (được tính tổng từ các ProductColors)

**File**: `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemDetailResponse.java`
- ✅ Giữ `qtyAvailable` (được tính tổng từ các ProductColors)

### 4. Backend - Mappers
**File**: `BackEnd/src/main/java/com/eaut/backend/untils/Mapper.java`
- ✅ Cập nhật `toProductColorResponse()` để include `qtyAvailable`
- ✅ Cập nhật `toProductColor()` để set `qtyAvailable` (default 0)
- ✅ Cập nhật `toProductItemDetailResponse()` để tính tổng quantity từ colors

### 5. Backend - Services
**File**: `BackEnd/src/main/java/com/eaut/backend/service/impl/ProductItemServiceImpl.java`
- ✅ Cập nhật `createProductColors()` để set `qtyAvailable` khi tạo color
- ✅ Cập nhật `updateProductColors()` để update `qtyAvailable` khi cập nhật color
- ✅ Cập nhật `mapToProductItemListResponse()` để tính tổng quantity từ tất cả colors

### 6. Frontend - Components
**File**: `FrontEnd/src/pages/Admin/Products/ProductItemList.jsx`

Các thay đổi:
- ✅ Xóa `qtyAvailable` khỏi formData level
- ✅ Thêm `qtyAvailable` vào mỗi color khi `addColor()`
- ✅ Thêm input `qtyAvailable` trong color edit UI
- ✅ Xóa FormInput `qtyAvailable` ở ProductItem level
- ✅ Cập nhật tất cả các hàm init formData (openModal, closeModal, selectProduct, etc.)
- ✅ Cập nhật handleSubmit để không gửi `qtyAvailable` ở ProductItem level

**File**: `FrontEnd/src/services/productItemService.js`
- ✅ Cập nhật JSDoc comment để phản ánh thay đổi

**File**: `FrontEnd/src/assets/css/admin/products.css`
- ✅ Thêm CSS cho `.color-qty-input`

## Cách chạy Migration

### Bước 1: Backup Database
```sql
-- Backup dữ liệu trước khi migrate
BACKUP DATABASE YourDatabaseName TO DISK = 'path/to/backup.bak'
```

### Bước 2: Chạy Migration Script
```bash
# Từ thư mục BackEnd
sqlcmd -S your_server -d your_database -i migrations/001_move_qty_to_product_colors.sql
```

Hoặc chạy script SQL trong SQL Server Management Studio:
1. Mở file `BackEnd/migrations/001_move_qty_to_product_colors.sql`
2. Chạy toàn bộ script

### Bước 3: Rebuild Backend
```bash
cd BackEnd
mvn clean install
```

### Bước 4: Rebuild Frontend
```bash
cd FrontEnd
npm install
npm run build
```

### Bước 5: Restart Applications
```bash
# Backend
mvn spring-boot:run

# Frontend
npm run dev
```

## Testing Checklist

### Backend Testing
- [ ] API tạo ProductItem mới với models và colors (có qtyAvailable)
- [ ] API cập nhật ProductItem với thay đổi quantity trong colors
- [ ] API lấy danh sách ProductItems - kiểm tra qtyAvailable được tính đúng
- [ ] API lấy chi tiết ProductItem - kiểm tra colors có qtyAvailable

### Frontend Testing
- [ ] Tạo ProductItem mới - nhập quantity cho từng màu
- [ ] Cập nhật ProductItem - thay đổi quantity của colors
- [ ] Xem danh sách ProductItems - hiển thị tổng quantity
- [ ] Xem chi tiết ProductItem - hiển thị quantity từng màu

## Rollback Plan

Nếu cần rollback về version cũ:

```sql
-- 1. Thêm lại qty_available vào product_items
ALTER TABLE product_items 
ADD qty_available INT NOT NULL DEFAULT 1;

-- 2. Xóa qty_available từ product_colors
ALTER TABLE product_colors
DROP COLUMN qty_available;

-- 3. Restore code từ git
git checkout <previous_commit_hash>
```

## Notes
- Số lượng tổng của ProductItem = Tổng qtyAvailable của tất cả ProductColors trong tất cả ProductModels
- Khi tạo color mới, mặc định qtyAvailable = 0
- Khi cập nhật, cần cập nhật qtyAvailable cho từng color riêng biệt
- UI hiển thị input quantity cho mỗi màu trong form tạo/sửa ProductItem

## Support
Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs backend (`BackEnd/logs/`)
2. Kiểm tra browser console cho frontend
3. Xem database constraints và indexes
4. Liên hệ team lead để được hỗ trợ
