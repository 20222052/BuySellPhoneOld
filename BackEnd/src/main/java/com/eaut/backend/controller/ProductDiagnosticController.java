package com.eaut.backend.controller;

import com.eaut.backend.entities.ProductDiagnostic;
import com.eaut.backend.model.request.DiagnosticRequest;
import com.eaut.backend.model.response.ProductDiagnosticDTO;
import com.eaut.backend.service.ProductDiagnosticService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/diagnostics")
@RequiredArgsConstructor
// @Tag(name = "Product Diagnostic", description = "API quản lý chẩn đoán tình
// trạng điện thoại")
public class ProductDiagnosticController {

    private final ProductDiagnosticService diagnosticService;

    /**
     * Tạo diagnostic từ thông tin người dùng gửi lên (Ảnh + Check list chức năng)
     * Request Body: JSON chứa danh sách ảnh (base64/url) và kết quả kiểm tra chức
     * năng
     */
    // @Operation(summary = "Tạo diagnostic (AI + Functional Checks)", description =
    // "Gửi danh sách ảnh và kết quả kiểm tra chức năng để AI phân tích và tổng
    // hợp")
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeDiagnostic(@RequestBody DiagnosticRequest request) {
        try {
            log.info("Received diagnostic request for product item: {}", request.getProductItemId());

            // Validate inputs
            if (request.getProductItemId() == null) {
                return ResponseEntity.badRequest().body("Product Item ID is required");
            }

            if (request.getImagePhoneOlds() == null || request.getImagePhoneOlds().isEmpty()) {
                return ResponseEntity.badRequest().body("At least one image (imagePhoneOlds) is required");
            }

            // Process diagnostic using the unified service method
            // Pass null for MultipartFile since we differ to JSON list
            ProductDiagnosticDTO result = diagnosticService.createDiagnosticFromAI(request, null);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to create diagnostic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create diagnostic: " + e.getMessage());
        }
    }

    /**
     * Lấy tất cả diagnostic của một product item
     */
    // @Operation(summary = "Lấy danh sách diagnostic của product item")
    @GetMapping("/product-item/{productItemId}")
    public ResponseEntity<List<ProductDiagnosticDTO>> getDiagnosticsByProductItem(
            @PathVariable UUID productItemId) {
        List<ProductDiagnosticDTO> diagnostics = diagnosticService.getDiagnosticsByProductItem(productItemId);
        return ResponseEntity.ok(diagnostics);
    }

    /**
     * Lấy diagnostic mới nhất của product item
     */
    // @Operation(summary = "Lấy diagnostic mới nhất của product item")
    @GetMapping("/product-item/{productItemId}/latest")
    public ResponseEntity<?> getLatestDiagnostic(@PathVariable UUID productItemId) {
        return diagnosticService.getLatestDiagnostic(productItemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy diagnostic theo ID
     */
    // @Operation(summary = "Lấy diagnostic theo ID")
    @GetMapping("/{diagnosticId}")
    public ResponseEntity<?> getDiagnosticById(@PathVariable UUID diagnosticId) {
        try {
            ProductDiagnosticDTO diagnostic = diagnosticService.getDiagnosticById(diagnosticId);
            return ResponseEntity.ok(diagnostic);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Cập nhật diagnostic (cho phép staff chỉnh sửa kết quả AI)
     */
    // @Operation(summary = "Cập nhật diagnostic", description = "Staff có thể chỉnh
    // sửa kết quả AI nếu cần")
    @PutMapping("/{diagnosticId}")
    public ResponseEntity<?> updateDiagnostic(
            @PathVariable UUID diagnosticId,
            @RequestBody ProductDiagnostic updates) {
        try {
            ProductDiagnosticDTO result = diagnosticService.updateDiagnostic(diagnosticId, updates);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to update diagnostic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update diagnostic: " + e.getMessage());
        }
    }

    /**
     * Xóa diagnostic
     */
    // @Operation(summary = "Xóa diagnostic")
    @DeleteMapping("/{diagnosticId}")
    public ResponseEntity<?> deleteDiagnostic(@PathVariable UUID diagnosticId) {
        try {
            diagnosticService.deleteDiagnostic(diagnosticId);
            return ResponseEntity.ok().body("Diagnostic deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete diagnostic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete diagnostic: " + e.getMessage());
        }
    }
}
