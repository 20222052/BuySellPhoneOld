package com.eaut.backend.service.AI_ChatBot;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.ProductEmbedding;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.repository.ProductEmbeddingRepository;
import com.eaut.backend.service.ProductItemService;
import com.eaut.backend.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagServiceImpl implements RagService {

    private final HuggingFaceEmbeddingService embeddingService;
    private final ProductEmbeddingRepository embeddingRepository;
    private final ProductFlatteningService flatteningService;
    private final ProductItemService productItemService;

    @org.springframework.beans.factory.annotation.Value("${spring.ai.rag.threshold}")
    private double similarityThreshold;

    /**
     * Hàm này được gọi khi Admin thêm/sửa sản phẩm để tạo embedding
     * và lưu vào Vector DB (manual implementation)
     */
    @Override
    @Transactional
    public void ingestProduct(UUID productItemId) {
        log.info("Bắt đầu ingest product: {}", productItemId);

        // 1. Sử dụng findByIdWithDetails để lấy toàn bộ thông tin sản phẩm
        ProductItemDetailResponse productDetail = productItemService.findByIdWithDetails(productItemId);

        // 2. Flatten product thành text
        String content = flatteningService.flattenProductToString(productDetail);
        log.info("Flattened content length: {}", content.length());

        // 3. Gọi HuggingFace API để lấy embedding
        List<Double> embedding = embeddingService.createEmbedding(content);
        log.info("embedding: {}", embedding);

        // 4. Format embedding cho pgvector
        String embeddingStr = embeddingService.formatEmbeddingForPgVector(embedding);

        log.info("embeddingStr: {}", embeddingStr);
        // 5. Lưu vào database với native query CAST
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        try {
            embeddingRepository.upsertEmbedding(
                    productItemId,
                    content,
                    embeddingStr,
                    now,
                    now);
            log.info("Đã lưu embedding cho sản phẩm: {}", productItemId);
        } catch (Exception e) {
            log.error("Lỗi khi lưu embedding: ", e);
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "Lỗi khi lưu embedding: " + e.getMessage());
        }
    }

    /**
     * Xóa sản phẩm khỏi Vector Store
     */
    @Override
    @Transactional
    public void deleteProduct(UUID productItemId) {
        log.info("Xóa embedding cho product: {}", productItemId);
        embeddingRepository.deleteById(productItemId);
        log.info("Đã xóa embedding sản phẩm ID: {}", productItemId);
    }

    /**
     * Tìm kiếm sản phẩm phù hợp với câu hỏi user
     * Trả về danh sách metadata của sản phẩm tương tự
     */
    @Override
    public List<Map<String, Object>> searchProducts(String userQuery) {
        log.info("Tìm kiếm sản phẩm với query: {}", userQuery);

        // 1. Tạo embedding cho user query
        List<Double> queryEmbedding = embeddingService.createEmbedding(userQuery);

        // 2. Format cho pgvector
        String embeddingStr = embeddingService.formatEmbeddingForPgVector(queryEmbedding);

        // 3. Tìm kiếm similarity với threshold (chỉ lấy kết quả có cosine distance <
        // threshold)
        // Cosine distance: 0 = giống nhất, 2 = khác nhất
        // Threshold 0.65 nghĩa là chỉ lấy sản phẩm có độ tương đồng cao
        List<ProductEmbedding> results = embeddingRepository.findSimilarWithThreshold(
                embeddingStr,
                similarityThreshold, // 0.65 từ application.yaml
                3 // Top 3 results
        );

        log.info("Tìm thấy {} sản phẩm tương tự (threshold: {})", results.size(), similarityThreshold);

        // 4. Chuyển đổi sang Map để trả về
        return results.stream()
                .map(pe -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("productItemId", pe.getProductItemId().toString());
                    result.put("content", pe.getContent()); // Content để chatbot có ngữ cảnh
                    return result;
                })
                .collect(Collectors.toList());
    }
}
