package com.eaut.backend.controller;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.model.request.ProductItemRequest;
import com.eaut.backend.model.request.UpdateStatusRequest;
import com.eaut.backend.model.request.UpdateTradeInRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductItemListResponse;
import com.eaut.backend.model.response.ProductItemResponse;
import com.eaut.backend.service.ProductItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/product-items")
public class ProductItemController {

        private final ProductItemService productItemService;

        @GetMapping
        public ResponseEntity<ApiResponse<PagingResponse<ProductItemResponse>>> getAll(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "product_id", required = false) UUID productId,
                        @RequestParam(name = "min_price", required = false) BigDecimal minPrice,
                        @RequestParam(name = "max_price", required = false) BigDecimal maxPrice,
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {
                ApiResponse<PagingResponse<ProductItemResponse>> response = productItemService
                                .findAll(searchText, productId, minPrice, maxPrice, sort, pageNumber, pageSize);
                return ResponseEntity.ok(response);
        }

        /**
         * API để lấy danh sách ProductItem với đầy đủ thông tin hiển thị
         * Bao gồm: thông tin product, brand, category, ảnh đại diện, rating, giảm giá
         * Hỗ trợ: tìm kiếm, lọc theo brand/category/status/price range, sắp xếp, phân
         * trang
         */
        @GetMapping("/list")
        public ResponseEntity<ApiResponse<PagingResponse<ProductItemListResponse>>> getAllForList(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "product_id", required = false) UUID productId,
                        @RequestParam(name = "brand_id", required = false) UUID brandId,
                        @RequestParam(name = "category_id", required = false) UUID categoryId,
                        @RequestParam(name = "status", required = false) ProductStatus status,
                        @RequestParam(name = "min_price", required = false) BigDecimal minPrice,
                        @RequestParam(name = "max_price", required = false) BigDecimal maxPrice,
                        @RequestParam(name = "is_trade_in", required = false) Integer isTradeIn,
                        @RequestParam(name = "sort_by", required = false, defaultValue = "createdAt") String sortBy,
                        @RequestParam(name = "sort_dir", required = false, defaultValue = "DESC") String sortDir,
                        @RequestParam(name = "random_enabled", required = false, defaultValue = "false") Boolean randomEnabled,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {

                log.info("Get all product items for list - search: {}, brandId: {}, categoryId: {}, status: {}, minPrice: {}, maxPrice: {}, isTradeIn: {}",
                                searchText, brandId, categoryId, status, minPrice, maxPrice, isTradeIn);

                ApiResponse<PagingResponse<ProductItemListResponse>> response = productItemService
                                .findAllForList(searchText, productId, brandId, categoryId, status,
                                                minPrice, maxPrice, isTradeIn, sortBy, sortDir, randomEnabled,
                                                pageNumber,
                                                pageSize);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ProductItemResponse>> getProductItemById(
                        @PathVariable UUID id) {
                ProductItemResponse response = productItemService.findById(id);
                ApiResponse<ProductItemResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item retrieved successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @GetMapping("/{id}/details")
        public ResponseEntity<ApiResponse<ProductItemDetailResponse>> getProductItemDetails(
                        @PathVariable UUID id) {
                ProductItemDetailResponse response = productItemService.findByIdWithDetails(id);
                ApiResponse<ProductItemDetailResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item details retrieved successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @PostMapping
        public ResponseEntity<ApiResponse<ProductItemResponse>> create(
                        @RequestBody ProductItemRequest request) {
                ProductItemResponse response = productItemService.create(request);
                ApiResponse<ProductItemResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.CREATED.value(),
                                "Product item created successfully",
                                true,
                                response);
                return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ProductItemResponse>> update(
                        @PathVariable UUID id,
                        @RequestBody ProductItemRequest request) {
                ProductItemResponse response = productItemService.update(id, request);
                ApiResponse<ProductItemResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item updated successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<ProductItemResponse>> updateStatus(
                        @PathVariable UUID id,
                        @RequestBody UpdateStatusRequest request) {
                ProductItemResponse response = productItemService.updateStatus(id, request.getStatus());
                ApiResponse<ProductItemResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item status updated successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @PatchMapping("/{id}/trade-in")
        public ResponseEntity<ApiResponse<ProductItemResponse>> updateTradeIn(
                        @PathVariable UUID id,
                        @RequestBody UpdateTradeInRequest request) {
                ProductItemResponse response = productItemService.updateTradeIn(id, request.getIsTradeIn());
                ApiResponse<ProductItemResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item trade-in status updated successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(
                        @PathVariable UUID id) {
                productItemService.delete(id);
                ApiResponse<Void> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Product item deleted successfully",
                                true,
                                null);
                return ResponseEntity.ok(apiResponse);
        }
}
