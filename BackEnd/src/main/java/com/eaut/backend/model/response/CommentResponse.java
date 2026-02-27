package com.eaut.backend.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentResponse {

    private Long id;

    private String content;

    /** ID của user đã comment */
    private String userId;

    /** Tên đầy đủ của user */
    private String userFullName;

    /** Avatar URL của user */
    private String userAvatar;

    /** ID của comment cha — null nếu là comment gốc */
    private Long parentId;

    /** Danh sách reply (chỉ 1 cấp) */
    private List<CommentResponse> replies;

    private LocalDateTime createdAt;

    private String status;
}
