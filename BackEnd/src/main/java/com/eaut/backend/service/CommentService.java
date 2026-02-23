package com.eaut.backend.service;

import com.eaut.backend.model.request.CommentRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CommentResponse;
import com.eaut.backend.model.response.PagingResponse;

import java.util.UUID;

public interface CommentService {

    /**
     * Thêm comment gốc vào blog.
     * Yêu cầu: user đã đăng nhập, blog phải tồn tại, content không được rỗng.
     */
    CommentResponse addComment(UUID blogId, CommentRequest request, UUID userId);

    /**
     * Reply vào một comment (chỉ cho phép 1 cấp reply).
     * Yêu cầu: comment cha phải tồn tại, đang ACTIVE và là comment gốc (không phải
     * reply).
     */
    CommentResponse replyToComment(Long parentCommentId, CommentRequest request, UUID userId);

    /**
     * Lấy comments của blog — public, có phân trang.
     * Chỉ trả về comment gốc, mỗi comment kèm danh sách replies.
     */
    ApiResponse<PagingResponse<CommentResponse>> getCommentsByBlog(UUID blogId, int pageNumber, int pageSize);

    /**
     * Soft-delete comment.
     * Người dùng chỉ xóa được comment của mình; ADMIN có thể xóa bất kỳ comment
     * nào.
     */
    void deleteComment(Long commentId, UUID userId);
}
