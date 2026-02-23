package com.eaut.backend.repository;

import com.eaut.backend.entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Lấy danh sách comment gốc (không có parent) theo target và ACTIVE
     * targetId lưu dạng String (hỗ trợ cả UUID và Long)
     */
    @Query("SELECT c FROM Comment c " +
            "WHERE c.targetType = :targetType " +
            "AND c.targetId = :targetId " +
            "AND c.parent IS NULL " +
            "AND c.status = 'ACTIVE'")
    Page<Comment> findRootCommentsByTarget(
            @Param("targetType") String targetType,
            @Param("targetId") String targetId,
            Pageable pageable);

    /**
     * Tìm comment theo id và status
     */
    Optional<Comment> findByIdAndStatus(Long id, String status);
}
