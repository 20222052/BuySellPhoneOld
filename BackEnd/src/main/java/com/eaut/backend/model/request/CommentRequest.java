package com.eaut.backend.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentRequest {

    @NotBlank(message = "Nội dung comment không được để trống")
    @Size(min = 1, max = 2000, message = "Nội dung comment phải từ 1 đến 2000 ký tự")
    private String content;

    /**
     * ID của comment cha — chỉ dùng khi reply.
     * Để null nếu đây là comment gốc.
     */
    private Long parentId;
}
