package com.eaut.backend.API;

import com.eaut.backend.Model.Request.ProductColorRequest;
import com.eaut.backend.Model.Response.ApiResponse;
import com.eaut.backend.Model.Response.PagingResponse;
import com.eaut.backend.Model.Response.ProductColorResponse;
import com.eaut.backend.Service.ProductColorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/productColors")
public class ProductColorController {
    final ProductColorService productColorService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagingResponse<ProductColorResponse>>> getAll(
            @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
            @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize
    ) {
        ApiResponse<PagingResponse<ProductColorResponse>> response = productColorService
                .findAll(searchText, sort, pageNumber, pageSize);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductColorResponse>> create(
            @RequestBody ProductColorRequest request
    ) {
        ProductColorResponse response = productColorService.create(request);
        ApiResponse <ProductColorResponse> apiResponse = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "productColor created successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductColorResponse>> update(
            @PathVariable UUID id,
            @RequestBody ProductColorRequest request
    ) {
        ProductColorResponse response = productColorService.update(id, request);
        ApiResponse <ProductColorResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "productColor updated successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductColorResponse>> getproductColorById(
            @PathVariable UUID id
    ) {
        ProductColorResponse response = productColorService.findById(id);
        ApiResponse <ProductColorResponse> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "ProductColor retrieved successfully",
                true,
                response
        );
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteProductColor(
            @RequestParam(name = "id") String id
    ) {
        productColorService.delete(UUID.fromString(id));
        ApiResponse<Void> apiResponse = new ApiResponse<>(
                HttpStatus.OK.value(),
                "ProductColor deleted successfully",
                true,
                null
        );
        return ResponseEntity.ok(apiResponse);
    }
}
