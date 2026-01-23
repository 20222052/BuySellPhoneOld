package com.eaut.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

// Entity này dùng để lưu các thông tin KHÔNG PHẢI SẢN PHẨM
// Ví dụ: Chính sách bảo hành chung, Địa chỉ cửa hàng, Giờ làm việc...
@Entity
@Table(name = "knowledge_base")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String topic; // Ví dụ: "Chính sách đổi trả"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Nội dung chi tiết để Embed
}