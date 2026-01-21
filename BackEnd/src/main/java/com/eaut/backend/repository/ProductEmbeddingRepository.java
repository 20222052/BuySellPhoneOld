package com.eaut.backend.repository;

import com.eaut.backend.entities.ProductEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductEmbeddingRepository extends JpaRepository<ProductEmbedding, UUID> {

    /**
     * Upsert ProductEmbedding với CAST để đảm bảo embedding được convert sang
     * vector type
     * 
     * @param productItemId ID của product item
     * @param content       Nội dung đã flatten
     * @param embedding     Vector embedding dưới dạng string "[0.1,0.2,...]"
     * @param createdAt     Thời gian tạo
     * @param updatedAt     Thời gian cập nhật
     */
    @Modifying
    @Query(value = """
            INSERT INTO product_embeddings (product_item_id, content, embedding, created_at, updated_at)
            VALUES (:productItemId, :content, CAST(:embedding AS vector), :createdAt, :updatedAt)
            ON CONFLICT (product_item_id)
            DO UPDATE SET
                content = EXCLUDED.content,
                embedding = EXCLUDED.embedding,
                updated_at = EXCLUDED.updated_at
            """, nativeQuery = true)
    void upsertEmbedding(
            @Param("productItemId") UUID productItemId,
            @Param("content") String content,
            @Param("embedding") String embedding,
            @Param("createdAt") LocalDateTime createdAt,
            @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * Tìm kiếm similarity sử dụng pgvector cosine distance operator (<=>)
     * 
     * @param queryEmbedding Vector embedding dạng string "[0.1,0.2,...]"
     * @param topK           Số lượng kết quả trả về
     * @return Danh sách ProductEmbedding được sắp xếp theo độ tương đồng
     */
    @Query(value = """
            SELECT * FROM product_embeddings
            ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
            LIMIT :topK
            """, nativeQuery = true)
    List<ProductEmbedding> findSimilar(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("topK") int topK);

    /**
     * Tìm kiếm similarity với ngưỡng distance tối đa
     * 
     * @param queryEmbedding Vector embedding dạng string "[0.1,0.2,...]"
     * @param maxDistance    Khoảng cách cosine tối đa (càng nhỏ càng giống)
     * @param topK           Số lượng kết quả
     */
    @Query(value = """
            SELECT * FROM product_embeddings
            WHERE (embedding <=> CAST(:queryEmbedding AS vector)) < :maxDistance
            ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
            LIMIT :topK
            """, nativeQuery = true)
    List<ProductEmbedding> findSimilarWithThreshold(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("maxDistance") double maxDistance,
            @Param("topK") int topK);

}
