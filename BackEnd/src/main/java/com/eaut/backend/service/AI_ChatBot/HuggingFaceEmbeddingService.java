package com.eaut.backend.service.AI_ChatBot;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service để gọi HuggingFace Inference API trực tiếp
 * Model: BAAI/bge-base-en-v1.5 (768 dimensions, miễn phí)
 */
@Service
@Slf4j
public class HuggingFaceEmbeddingService {

    @Value("${huggingface.api.key}")
    private String apiKey;

    @Value("${huggingface.api.embedding-endpoint}")
    private String embeddingEndpoint;

    private final RestClient restClient;

    public HuggingFaceEmbeddingService() {
        this.restClient = RestClient.builder()
                .build();
    }

    /**
     * Tạo embedding vector từ text
     * 
     * @param text Text cần embedding
     * @return List của 768 số Double
     */
    public List<Double> createEmbedding(String text) {
        log.info("Gọi HuggingFace API để tạo embedding cho text length: {}", text.length());

        try {
            // Request body: {"inputs": "text"}
            Map<String, String> requestBody = Map.of("inputs", text);

            // Call API
            Double[] response = restClient.post()
                    .uri(embeddingEndpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Double[].class);

            // Response là array 1 chiều: [0.1, 0.2, ...]
            // (Đối với single text input)
            if (response != null && response.length > 0) {
                List<Double> embedding = Arrays.asList(response);
                log.info("Embedding được tạo thành công với {} dimensions", embedding.size());
                return embedding;
            } else {
                throw new RuntimeException("HuggingFace API trả về response rỗng");
            }

        } catch (Exception e) {
            log.error("Lỗi khi gọi HuggingFace API: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo embedding: " + e.getMessage(), e);
        }
    }

    /**
     * Batch embedding cho nhiều texts
     * 
     * @param texts Danh sách text cần embedding
     * @return Danh sách embedding vectors
     */
    public List<List<Double>> createEmbeddings(List<String> texts) {
        log.info("Tạo embeddings cho {} texts", texts.size());

        // HuggingFace hỗ trợ batch input
        // Request body: {"inputs": ["text1", "text2", ...]}
        try {
            Map<String, List<String>> requestBody = Map.of("inputs", texts);

            Double[][] response = restClient.post()
                    .uri(embeddingEndpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Double[][].class);

            if (response != null) {
                // Chuyển đổi Double[][] thành List<List<Double>>
                return Arrays.stream(response)
                        .map(Arrays::asList)
                        .collect(Collectors.toList());
            } else {
                throw new RuntimeException("HuggingFace API trả về response rỗng");
            }

        } catch (Exception e) {
            log.error("Lỗi khi gọi HuggingFace batch API: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo batch embeddings: " + e.getMessage(), e);
        }
    }

    /**
     * Format embedding vector thành string cho pgvector
     * Format: "[0.1,0.2,0.3,...]"
     * 
     * @param embedding List các số Double
     * @return String format cho pgvector
     */
    public String formatEmbeddingForPgVector(List<Double> embedding) {
        return "[" + embedding.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(",")) + "]";
    }
}
