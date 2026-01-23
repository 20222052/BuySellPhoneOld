package com.eaut.backend.controller;

import com.eaut.backend.model.request.BlogRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.BlogResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.service.BlogService;
import com.eaut.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/blogs")
public class BlogController {

        private final BlogService blogService;
        private final UserService userService;

        /**
         * Lấy danh sách tất cả blogs với phân trang và tìm kiếm (public)
         */
        @GetMapping
        public ResponseEntity<ApiResponse<PagingResponse<BlogResponse>>> getAll(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {

                ApiResponse<PagingResponse<BlogResponse>> response = blogService
                                .findAll(searchText, sort, pageNumber, pageSize);
                return ResponseEntity.ok(response);
        }

        /**
         * Lấy danh sách blogs public cho trang home
         */
        @GetMapping("/list")
        public ResponseEntity<ApiResponse<PagingResponse<BlogResponse>>> getList(
                        @RequestParam(name = "search", required = false, defaultValue = "") String searchText,
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {

                ApiResponse<PagingResponse<BlogResponse>> response = blogService
                                .findAll(searchText, sort, pageNumber, pageSize);
                return ResponseEntity.ok(response);
        }

        /**
         * Lấy chi tiết blog theo ID (public, tăng view count)
         */
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<BlogResponse>> getBlogById(@PathVariable UUID id) {
                BlogResponse response = blogService.findByIdAndIncrementView(id);
                ApiResponse<BlogResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Blog retrieved successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        /**
         * Tạo blog mới (requires authentication)
         */
        @PostMapping
        public ResponseEntity<ApiResponse<BlogResponse>> create(
                        @RequestBody BlogRequest request,
                        @AuthenticationPrincipal Jwt jwt) {

                UserResponse user = userService.getMyInfo();
                log.info("Create blog by user: {}", user.getId());
                if (request.getAuthor() == null || request.getAuthor().isEmpty()) {
                        request.setAuthor(user.getFullName());
                }
                BlogResponse response = blogService.create(request, user.getId());
                ApiResponse<BlogResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.CREATED.value(),
                                "Blog created successfully",
                                true,
                                response);
                return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }

        /**
         * Cập nhật blog (requires authentication)
         */
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<BlogResponse>> update(
                        @PathVariable UUID id,
                        @RequestBody BlogRequest request,
                        @AuthenticationPrincipal Jwt jwt) {

                UserResponse user = userService.getMyInfo();
                log.info("Updating blog: {} by user: {}", id, user.getId());

                BlogResponse response = blogService.update(id, request, user.getId());
                ApiResponse<BlogResponse> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Blog updated successfully",
                                true,
                                response);
                return ResponseEntity.ok(apiResponse);
        }

        /**
         * Xóa blog (requires authentication)
         */
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(
                        @PathVariable UUID id,
                        @AuthenticationPrincipal Jwt jwt) {

                UserResponse user = userService.getMyInfo();
                log.info("Deleting blog: {} by user: {}", id, user.getId());

                blogService.delete(id);
                ApiResponse<Void> apiResponse = new ApiResponse<>(
                                HttpStatus.OK.value(),
                                "Blog deleted successfully",
                                true,
                                null);
                return ResponseEntity.ok(apiResponse);
        }

        /**
         * Lấy danh sách blogs của user đang đăng nhập
         */
        @GetMapping("/my-blogs")
        public ResponseEntity<ApiResponse<PagingResponse<BlogResponse>>> getMyBlogs(
                        @RequestParam(name = "sort", required = false, defaultValue = "DESC") String sort,
                        @RequestParam(name = "page", defaultValue = "0") int pageNumber,
                        @RequestParam(name = "page_size", defaultValue = "10") int pageSize,
                        @AuthenticationPrincipal Jwt jwt) {

                UUID userId = UUID.fromString(jwt.getClaimAsString("id"));
                ApiResponse<PagingResponse<BlogResponse>> response = blogService
                                .findByUserId(userId, sort, pageNumber, pageSize);
                return ResponseEntity.ok(response);
        }
}
