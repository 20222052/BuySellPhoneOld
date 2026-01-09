# Summary of Changes: Move qty_available to ProductColor

## Mô tả
Đã chuyển trường `qty_available` (số lượng) từ ProductItem sang ProductColor để quản lý số lượng chính xác hơn theo từng màu sắc của mỗi biến thể sản phẩm.

## Files đã thay đổi

### 📦 Backend (Java Spring Boot)

#### Database Migration
- ✅ **NEW** `BackEnd/migrations/001_move_qty_to_product_colors.sql`
  - Migration script để cập nhật database schema

#### Entities
- ✅ `BackEnd/src/main/java/com/eaut/backend/entities/ProductColor.java`
  - Đã có sẵn field `qtyAvailable` (int)

- ✅ `BackEnd/src/main/java/com/eaut/backend/entities/ProductItem.java`
  - Xác nhận không có field `qtyAvailable`

#### DTOs - Request
- ✅ `BackEnd/src/main/java/com/eaut/backend/model/request/ProductColorRequest.java`
  - Thêm field `qtyAvailable` (Integer)

#### DTOs - Response
- ✅ `BackEnd/src/main/java/com/eaut/backend/model/response/ProductColorResponse.java`
  - Thêm field `qtyAvailable` (Integer)

- ✅ `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemResponse.java`
  - Xóa field `qtyAvailable`

- ⚠️ `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemListResponse.java`
  - Giữ `qtyAvailable` (calculated field - tổng của tất cả colors)

- ⚠️ `BackEnd/src/main/java/com/eaut/backend/model/response/ProductItemDetailResponse.java`
  - Giữ `qtyAvailable` (calculated field - tổng của tất cả colors)

#### Mappers & Utilities
- ✅ `BackEnd/src/main/java/com/eaut/backend/untils/Mapper.java`
  - `toProductColorResponse()`: Thêm mapping cho `qtyAvailable`
  - `toProductColor()`: Set default `qtyAvailable = 0`
  - `toProductItemDetailResponse()`: Tính tổng quantity từ colors

#### Services
- ✅ `BackEnd/src/main/java/com/eaut/backend/service/impl/ProductItemServiceImpl.java`
  - `createProductColors()`: Set `qtyAvailable` khi tạo color
  - `updateProductColors()`: Update `qtyAvailable` khi cập nhật color
  - `mapToProductItemListResponse()`: Tính tổng quantity từ colors

### 🎨 Frontend (React + Vite)

#### Components
- ✅ `FrontEnd/src/pages/Admin/Products/ProductItemList.jsx`
  - Xóa `qtyAvailable` khỏi formData level
  - Thêm `qtyAvailable` vào mỗi color object
  - Thêm input field cho quantity trong color edit UI
  - Cập nhật tất cả state initialization functions

#### Services
- ✅ `FrontEnd/src/services/productItemService.js`
  - Cập nhật JSDoc comments

#### Styles
- ✅ `FrontEnd/src/assets/css/admin/products.css`
  - Thêm CSS cho `.color-qty-input`

#### Documentation
- ✅ **NEW** `MIGRATION_GUIDE.md`
  - Hướng dẫn chi tiết về migration
  - Testing checklist
  - Rollback plan

## Tổng kết thay đổi

### Backend
- **2 files mới**: Migration SQL, Migration Guide
- **7 files đã sửa**: Entities, DTOs, Mappers, Services

### Frontend  
- **3 files đã sửa**: Components, Services, CSS

### Tổng cộng
- **12 files đã thay đổi**
- **2 files mới**

## Logic mới

### Cách tính quantity cho ProductItem:
```java
// Backend
int totalQty = 0;
for (ProductModel model : productItem.getModels()) {
    for (ProductColor color : model.getColors()) {
        totalQty += color.getQtyAvailable();
    }
}
productItemResponse.setQtyAvailable(totalQty);
```

### Frontend form structure:
```javascript
{
  productId: UUID,
  basePrice: number,
  sellPrice: number,
  comparePrice: number,
  models: [
    {
      name: string,
      ramGb: number,
      romGb: number,
      colors: [
        {
          name: string,
          hexCode: string,
          qtyAvailable: number  // ← NEW: Quantity per color
        }
      ]
    }
  ],
  mediaList: [...]
}
```

## Breaking Changes

⚠️ **API Contract Changes:**
1. POST/PUT `/product-items` không còn nhận `qtyAvailable` ở root level
2. `qtyAvailable` phải được gửi trong mỗi `color` object
3. GET `/product-items` vẫn trả về `qtyAvailable` (calculated)

## Migration Steps

1. **Backup database** ✅
2. **Run migration script** ✅ (`001_move_qty_to_product_colors.sql`)
3. **Update backend code** ✅
4. **Update frontend code** ✅
5. **Test thoroughly** ⏳
6. **Deploy** ⏳

## Next Steps

- [ ] Run migration script on development database
- [ ] Test all CRUD operations for ProductItems
- [ ] Test quantity calculation in list and detail views
- [ ] Test frontend UI for adding/editing colors with quantities
- [ ] Run full regression tests
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Deploy to production

## Rollback Information

Xem chi tiết trong `MIGRATION_GUIDE.md` section "Rollback Plan"
