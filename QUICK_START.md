# 🚀 Quick Start - AI Phone Diagnostic System

## ⚡ Chạy Hệ Thống (3 Bước)

### Bước 1: Start Flask AI Server
```bash
cd aiServer
pip install -r requirements.txt
python phone_diagnostic_api.py
```

✅ Xem log: `[INFO] Server running on http://localhost:5000`

---

### Bước 2: Start Spring Boot Backend
```bash
cd BackEnd
./mvnw spring-boot:run
```

✅ Xem log: `Started BackEndApplication`

---

### Bước 3: Test API
```bash
cd aiServer
python test_diagnostic_api.py
```

✅ Xem kết quả: `✅ PASS: Diagnostic API`

---

## 📡 API Endpoints

### Flask (Python) - Port 5000

```bash
# Health check
curl http://localhost:5000/health

# Phân tích ảnh
curl -X POST http://localhost:5000/api/diagnose \
  -F "file=@path/to/image.jpg"
```

### Spring Boot (Java) - Port 8080

```bash
# Tạo diagnostic (tự động lưu DB)
POST http://localhost:8080/api/diagnostics/analyze
  - productItemId: [UUID]
  - image: [file]

# Xem lịch sử diagnostic
GET http://localhost:8080/api/diagnostics/product-item/{productItemId}
```

---

## 📁 Files Đã Tạo

### Python (Flask AI Server)
- [`aiServer/phone_diagnostic_api.py`](file:///d:/DONGA/nam4/DATN/buysellphoneold/aiServer/phone_diagnostic_api.py) - Flask API server
- [`aiServer/requirements.txt`](file:///d:/DONGA/nam4/DATN/buysellphoneold/aiServer/requirements.txt) - Dependencies
- [`aiServer/test_diagnostic_api.py`](file:///d:/DONGA/nam4/DATN/buysellphoneold/aiServer/test_diagnostic_api.py) - Test script

### Java (Spring Boot Backend)

**Controllers:**
- [`ProductDiagnosticController.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/controller/ProductDiagnosticController.java)

**Services:**
- [`ProductDiagnosticService.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/service/ProductDiagnosticService.java)

**Repositories:**
- [`ProductDiagnosticRepository.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/repository/ProductDiagnosticRepository.java)

**DTOs:**
- [`DiagnosticRequest.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/model/request/DiagnosticRequest.java)
- [`DiagnosticResponse.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/model/response/DiagnosticResponse.java)
- [`ProductDiagnosticDTO.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/model/response/ProductDiagnosticDTO.java)

**Config:**
- [`RestTemplateConfig.java`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/java/com/eaut/backend/config/RestTemplateConfig.java)
- [`application.yaml`](file:///d:/DONGA/nam4/DATN/buysellphoneold/BackEnd/src/main/resources/application.yaml) (đã update)

### Tài liệu
- [`AI_DIAGNOSTIC_GUIDE.md`](file:///d:/DONGA/nam4/DATN/buysellphoneold/AI_DIAGNOSTIC_GUIDE.md) - Hướng dẫn đầy đủ
- [`aiServer/README_VI.md`](file:///d:/DONGA/nam4/DATN/buysellphoneold/aiServer/README_VI.md) - Tài liệu AI server

---

## 🎯 Chức Năng Chính

### 1. Upload ảnh → AI phân tích tự động
- 7 tiêu chí đánh giá (màn hình, trầy xước, móp méo, v.v.)
- Tính điểm hao mòn tổng thể (0-100%)
- Đánh giá: Excellent / Good / Fair / Poor

### 2. Lưu kết quả vào Database
- Entity: `ProductDiagnostic`
- Liên kết với `ProductItem`
- Tracking bởi staff

### 3. Xem lịch sử diagnostic
- Tất cả diagnostic của 1 product
- Xem diagnostic mới nhất
- Chỉnh sửa nếu cần

---

## 🧪 Test Ngay

```bash
# Test Flask API
cd aiServer
python test_diagnostic_api.py

# Mở Swagger UI
http://localhost:8080/api/swagger-ui.html
```

---

## 📊 Kết Quả Mẫu

```json
{
  "screenCracks": 15.5,      // 15.5% hư hỏng
  "scratches": 25.0,         // 25% trầy xước
  "totalDepreciation": 12.75, // 12.75% hao mòn
  "overallAssessment": "Good - Thiết bị trong tình trạng khá tốt"
}
```

---

## ❓ Troubleshooting

**Flask không start**:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Out of memory**:
- Giảm kích thước ảnh (< 1024px)
- Model sẽ tự động chạy trên CPU

**Connection refused**:
- Check Flask server đang chạy: `http://localhost:5000/health`
- Check Spring Boot: `http://localhost:8080/api/actuator/health`

---

## 📖 Đọc Thêm

Chi tiết đầy đủ trong: [`AI_DIAGNOSTIC_GUIDE.md`](file:///d:/DONGA/nam4/DATN/buysellphoneold/AI_DIAGNOSTIC_GUIDE.md)

---

**Ready to go! 🎉**
