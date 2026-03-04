package com.eaut.backend.controller;

import com.eaut.backend.constant.DiagnosticStatus;
import com.eaut.backend.entities.ProductDiagnostic;
import com.eaut.backend.model.request.DiagnosticRequest;
import com.eaut.backend.model.response.ProductDiagnosticDTO;
import com.eaut.backend.service.ProductDiagnosticService;
import com.eaut.backend.service.UserService;
import com.eaut.backend.model.response.UserResponse;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/diagnostics")
@RequiredArgsConstructor
// @Tag(name = "Product Diagnostic", description = "API quản lý chẩn đoán tình
// trạng điện thoại")
public class ProductDiagnosticController {

    private final ProductDiagnosticService diagnosticService;
    private final UserService userService;

    /**
     * Tạo diagnostic từ thông tin người dùng gửi lên (Ảnh + Check list chức năng)
     * Request Body: Multipart/form-data
     * - data: JSON chứa thông tin check list chức năng, etc.
     * - files: Danh sách ảnh (tối đa 5 file)
     */
    // @Operation(summary = "Tạo diagnostic (AI + Functional Checks)", description =
    // "Gửi danh sách ảnh và kết quả kiểm tra chức năng để AI phân tích và tổng
    // hợp")
    @PostMapping(value = "/analyze", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeDiagnostic(
            @RequestPart("data") DiagnosticRequest request,
            @RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files) {
        try {
            log.info("Received diagnostic request for product item: {}", request.getProductItemId());

            // Validate inputs
            if (request.getProductItemId() == null) {
                return ResponseEntity.badRequest().body("Product Item ID is required");
            }

            // Validate images
            if (files != null && files.size() > 5) {
                return ResponseEntity.badRequest().body("You can only upload a maximum of 5 images.");
            }

            if ((files == null || files.isEmpty())
                    && (request.getImagePhoneOlds() == null || request.getImagePhoneOlds().isEmpty())) {
                return ResponseEntity.badRequest().body("At least one image is required (files or imagePhoneOlds)");
            }

            // Process diagnostic using the unified service method
            ProductDiagnosticDTO result = diagnosticService.createDiagnosticFromAI(request, files);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to create diagnostic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create diagnostic: " + e.getMessage());
        }
    }

    /**
     * Lấy lịch sử diagnostic của user đang đăng nhập
     */
    @GetMapping("/user/my-history")
    public ResponseEntity<?> getMyHistory() {
        try {
            UserResponse user = userService.getMyInfo();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            return ResponseEntity.ok(diagnosticService.getDiagnosticsByUserId(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
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

    // ===================== ADMIN ENDPOINTS =====================

    /**
     * Lấy tất cả diagnostic cho admin (có pagination)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllDiagnosticsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "testDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("ASC")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            PageRequest pageable = PageRequest.of(page, size, sort);

            DiagnosticStatus diagnosticStatus = null;
            if (status != null && !status.isEmpty()) {
                try {
                    diagnosticStatus = DiagnosticStatus.valueOf(status.toLowerCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status filter: {}", status);
                }
            }

            Page<ProductDiagnosticDTO> result = diagnosticService.getAllDiagnosticsForAdmin(pageable, diagnosticStatus);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to get all diagnostics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get diagnostics: " + e.getMessage());
        }
    }

    /**
     * Cập nhật trạng thái diagnostic
     */
    @PutMapping("/admin/{diagnosticId}/status")
    public ResponseEntity<?> updateDiagnosticStatus(
            @PathVariable UUID diagnosticId,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().body("Status is required");
            }

            DiagnosticStatus status;
            try {
                status = DiagnosticStatus.valueOf(statusStr.toLowerCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + statusStr);
            }

            String staffMessage = request.getOrDefault("message", "");
            ProductDiagnosticDTO result = diagnosticService.updateDiagnosticStatus(diagnosticId, status, staffMessage);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to update diagnostic status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update status: " + e.getMessage());
        }
    }
}
