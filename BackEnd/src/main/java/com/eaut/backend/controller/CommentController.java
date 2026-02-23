package com.eaut.backend.controller;

import com.eaut.backend.model.request.CommentRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CommentResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.service.CommentService;
import com.eaut.backend.service.UserService;
import jakarta.validation.Valid;
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
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;


    /**
     * [PUBLIC] Lấy danh sách comment của blog, có phân trang.
     * GET /blogs/{blogId}/comments
     */
    @GetMapping("/blogs/{blogId}/comments")
    public ResponseEntity<ApiResponse<PagingResponse<CommentResponse>>> getCommentsByBlog(
            @PathVariable UUID blogId,
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize) {

        log.info("GET /blogs/{}/comments page={} size={}", blogId, pageNumber, pageSize);
        ApiResponse<PagingResponse<CommentResponse>> response = commentService.getCommentsByBlog(blogId, pageNumber,
                pageSize);
        return ResponseEntity.ok(response);
    }

    /**
     * [AUTHENTICATED] Thêm comment mới vào bài viết.
     * POST /blogs/{blogId}/comments
     */
    @PostMapping("/blogs/{blogId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID blogId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UserResponse user = userService.getMyInfo();
        log.info("Create blog by user: {}", user.getId());

        CommentResponse comment = commentService.addComment(blogId, request, user.getId());

        ApiResponse<CommentResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Comment đã được thêm thành công",
                true,
                comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * [AUTHENTICATED] Reply vào một comment.
     * POST /comments/{commentId}/replies
     */
    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<CommentResponse>> replyToComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UserResponse user = userService.getMyInfo();
        log.info("Create blog by user: {}", user.getId());

        CommentResponse reply = commentService.replyToComment(commentId, request, user.getId());

        ApiResponse<CommentResponse> response = new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Reply đã được thêm thành công",
                true,
                reply);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * [AUTHENTICATED] Xóa comment (chỉ chủ sở hữu hoặc ADMIN).
     * DELETE /comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Jwt jwt) {

        UserResponse user = userService.getMyInfo();
        log.info("Delete comment {} by user: {}", commentId, user.getId());

        commentService.deleteComment(commentId, user.getId());

        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Comment đã được xóa thành công",
                true,
                null);
        return ResponseEntity.ok(response);
    }
}
