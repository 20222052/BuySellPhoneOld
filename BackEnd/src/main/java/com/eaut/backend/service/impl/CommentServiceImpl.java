package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.Comment;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.CommentRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.CommentResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.repository.BlogRepository;
import com.eaut.backend.repository.CommentRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.CommentService;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private static final String COMMENT_STATUS_ACTIVE = "ACTIVE";
    private static final String COMMENT_STATUS_DELETED = "DELETED";
    private static final String TARGET_TYPE_BLOG = "BLOG";

    private final CommentRepository commentRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    // =====================================================================
    // PUBLIC METHODS
    // =====================================================================

    @Override
    @Transactional
    public CommentResponse addComment(UUID blogId, CommentRequest request, UUID userId) {
        log.info("User {} adding comment to blog {}", userId, blogId);

        // Validate request
        validateCommentRequest(request);

        // Validate blog tồn tại
        validateBlogExistsOrThrow(blogId);

        // Validate user tồn tại và đang active
        User user = findActiveUserOrThrow(userId);

        // Tạo comment gốc
        Comment comment = Comment.builder()
                .content(request.getContent().trim())
                .user(user)
                .targetType(TARGET_TYPE_BLOG)
                .targetId(blogId.toString())
                .parent(null)
                .status(COMMENT_STATUS_ACTIVE)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("Comment {} created on blog {} by user {}", saved.getId(), blogId, userId);

        return Mapper.toCommentResponse(saved);
    }

    @Override
    @Transactional
    public CommentResponse replyToComment(Long parentCommentId, CommentRequest request, UUID userId) {
        log.info("User {} replying to comment {}", userId, parentCommentId);

        // Validate request
        validateCommentRequest(request);

        // Validate comment cha tồn tại và đang ACTIVE
        Comment parentComment = findActiveCommentOrThrow(parentCommentId);

        // Chỉ cho phép reply ở cấp 1 — không cho reply của reply
        if (parentComment.getParent() != null) {
            throw new ApplicationException(ErrorCode.INVALID_REQUEST,
                    "Không thể reply vào một reply. Chỉ được phép reply vào comment gốc.");
        }

        // Validate user tồn tại và đang active
        User user = findActiveUserOrThrow(userId);

        // Tạo reply, kế thừa targetType + targetId từ parent
        Comment reply = Comment.builder()
                .content(request.getContent().trim())
                .user(user)
                .targetType(parentComment.getTargetType())
                .targetId(parentComment.getTargetId())
                .parent(parentComment)
                .status(COMMENT_STATUS_ACTIVE)
                .build();

        Comment saved = commentRepository.save(reply);
        log.info("Reply {} created on comment {} by user {}", saved.getId(), parentCommentId, userId);

        return Mapper.toCommentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<CommentResponse>> getCommentsByBlog(
            UUID blogId, int pageNumber, int pageSize) {
        log.info("Getting comments for blog {}, page={}, size={}", blogId, pageNumber, pageSize);

        // Validate blog tồn tại
        validateBlogExistsOrThrow(blogId);

        // Validate pagination params
        if (pageNumber < 0) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,
                    "Số trang không được âm");
        }
        if (pageSize < 1 || pageSize > 100) {
            throw new ApplicationException(ErrorCode.VALUES_OUT_OF_RANGE,
                    "Kích thước trang phải từ 1 đến 100");
        }

        Pageable pageable = PagingUtils.buildPageable(pageNumber, pageSize, "DESC", "createdAt");

        Page<Comment> commentPage = commentRepository
                .findRootCommentsByTarget(TARGET_TYPE_BLOG, blogId.toString(), pageable);

        List<CommentResponse> items = commentPage.stream()
                .map(Mapper::toCommentResponseWithReplies)
                .toList();

        PagingResponse<CommentResponse> paged = PagingResponse.<CommentResponse>builder()
                .items(items)
                .page(commentPage.getNumber())
                .size(commentPage.getSize())
                .totalElements(commentPage.getTotalElements())
                .totalPages(commentPage.getTotalPages())
                .build();

        return new ApiResponse<>(HttpStatus.OK.value(), "Lấy danh sách comment thành công", true, paged);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, UUID userId) {
        log.info("User {} deleting comment {}", userId, commentId);

        // Validate comment tồn tại và đang ACTIVE
        Comment comment = findActiveCommentOrThrow(commentId);

        // Validate user tồn tại và đang active
        User user = findActiveUserOrThrow(userId);

        // Kiểm tra quyền: chỉ chủ comment hoặc ADMIN được xóa
        boolean isOwner = comment.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRoles() != null &&
                user.getRoles().stream()
                        .anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName()));

        if (!isOwner && !isAdmin) {
            throw new ApplicationException(ErrorCode.FORBIDDEN,
                    "Bạn không có quyền xóa comment này");
        }

        // Soft-delete: đánh dấu DELETED, không xóa khỏi DB
        comment.setStatus(COMMENT_STATUS_DELETED);
        commentRepository.save(comment);

        log.info("Comment {} soft-deleted by user {}", commentId, userId);
    }

    // =====================================================================
    // PRIVATE HELPER METHODS — validate và throw ApplicationException
    // =====================================================================

    /**
     * Validate nội dung comment request.
     * Ném ApplicationException nếu không hợp lệ.
     */
    private void validateCommentRequest(CommentRequest request) {
        if (request == null) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Dữ liệu request không được để trống");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ApplicationException(ErrorCode.FIELD_REQUIRED,
                    "Nội dung comment không được để trống");
        }
        if (request.getContent().trim().length() > 2000) {
            throw new ApplicationException(ErrorCode.VALUES_OUT_OF_RANGE,
                    "Nội dung comment không được vượt quá 2000 ký tự");
        }
    }

    /**
     * Kiểm tra blog có tồn tại không.
     * Ném ApplicationException NOT_FOUND nếu không tồn tại.
     */
    private void validateBlogExistsOrThrow(UUID blogId) {
        if (blogId == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,
                    "ID blog không được để trống");
        }
        boolean exists = blogRepository.existsById(blogId);
        if (!exists) {
            throw new ApplicationException(ErrorCode.NOT_FOUND,
                    "Không tìm thấy bài viết với ID: " + blogId);
        }
    }

    /**
     * Tìm user đang active theo UUID.
     * Ném ApplicationException nếu không tìm thấy hoặc tài khoản bị khóa.
     */
    private User findActiveUserOrThrow(UUID userId) {
        if (userId == null) {
            throw new ApplicationException(ErrorCode.UNAUTHORIZED,
                    "Không xác định được người dùng, vui lòng đăng nhập lại");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy người dùng với ID: " + userId));

        if (user.getStatus() == null || !"active".equalsIgnoreCase(user.getStatus().name())) {
            throw new ApplicationException(ErrorCode.ACCOUNT_SUSPENDED,
                    "Tài khoản đã bị khóa hoặc không còn hoạt động, không thể thực hiện thao tác này");
        }
        return user;
    }

    /**
     * Tìm comment theo ID và chỉ trả về nếu đang ACTIVE.
     * Ném ApplicationException NOT_FOUND nếu không tồn tại hoặc đã bị xóa.
     */
    private Comment findActiveCommentOrThrow(Long commentId) {
        if (commentId == null || commentId <= 0) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER,
                    "ID comment không hợp lệ");
        }
        return commentRepository.findByIdAndStatus(commentId, COMMENT_STATUS_ACTIVE)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND,
                        "Không tìm thấy comment hoặc comment đã bị xóa (ID: " + commentId + ")"));
    }
}
