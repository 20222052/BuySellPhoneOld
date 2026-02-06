package com.eaut.backend.service;

import com.eaut.backend.constant.DiagnosticStatus;
import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.ProductDiagnostic;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.DiagnosticRequest;
import com.eaut.backend.model.response.DiagnosticResponse;
import com.eaut.backend.model.response.ProductDiagnosticDTO;
import com.eaut.backend.model.response.UserResponse;
import com.eaut.backend.repository.ProductDiagnosticRepository;
import com.eaut.backend.repository.ProductItemRepository;
import com.eaut.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductDiagnosticService {

    private final ProductDiagnosticRepository diagnosticRepository;
    private final ProductItemRepository productItemRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.diagnostic.api.url:http://localhost:5000}")
    private String aiApiUrl;

    @Value("${ai.diagnostic.api.token}")
    private String aiApiToken;

    /**
     * Gọi AI service để phân tích ảnh
     */
    public DiagnosticResponse callAIDiagnostic(MultipartFile imageFile) {
        try {
            log.info("Calling AI diagnostic service at: {}", aiApiUrl);

            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Bearer " + aiApiToken);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Convert MultipartFile to File
            File tempFile = File.createTempFile("diagnostic_", "_" + imageFile.getOriginalFilename());
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(imageFile.getBytes());
            }

            body.add("file", new FileSystemResource(tempFile));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Call AI API
            String url = aiApiUrl + "/api/diagnose";
            ResponseEntity<DiagnosticResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    DiagnosticResponse.class);

            // Clean up temp file
            tempFile.delete();

            log.info("AI diagnostic completed successfully");
            return response.getBody();

        } catch (Exception e) {
            log.error("Failed to call AI diagnostic service", e);
            throw new RuntimeException("AI diagnostic service failed: " + e.getMessage());
        }
    }

    /**
     * Gọi AI service với base64 image
     */
    public DiagnosticResponse callAIDiagnosticWithBase64(String imageBase64) {
        try {
            log.info("Calling AI diagnostic service with base64 image");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiApiToken);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("image", imageBase64);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            String url = aiApiUrl + "/api/diagnose";
            ResponseEntity<DiagnosticResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    DiagnosticResponse.class);

            log.info("AI diagnostic completed successfully");
            return response.getBody();

        } catch (Exception e) {
            log.error("Failed to call AI diagnostic service", e);
            throw new RuntimeException("AI diagnostic service failed: " + e.getMessage());
        }
    }

    /**
     * Tạo diagnostic mới từ kết quả AI
     */
    public ProductDiagnosticDTO createDiagnosticFromAI(DiagnosticRequest request, List<MultipartFile> files) {
        // 1. Validate product item exists
        ProductItem productItem = productItemRepository.findById(request.getProductItemId())
                .orElseThrow(() -> new RuntimeException("Product item not found: " + request.getProductItemId()));

        // 2. Prepare Payload for AI (Images + Functional Checks)
        Map<String, Object> aiPayload = new HashMap<>();

        // Handle images
        List<String> images = request.getImagePhoneOlds();
        if (images == null)
            images = new ArrayList<>();

        // Process uploaded files if any
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                        images.add(base64);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to process image file: " + file.getOriginalFilename(), e);
                    }
                }
            }
        }

        if (images.isEmpty()) {
            throw new RuntimeException("No images provided for diagnostic");
        }
        aiPayload.put("images", images);

        // Handle functional checks
        Map<String, Object> functionalChecks = new HashMap<>();
        functionalChecks.put("microphoneDamage", request.getMicrophoneDamage());
        functionalChecks.put("frontCameraDamage", request.getFrontCameraDamage());
        functionalChecks.put("rearCameraDamage", request.getRearCameraDamage());
        functionalChecks.put("batteryHealth", request.getBatteryHealth());
        functionalChecks.put("chargingPortDamage", request.getChargingPortDamage());
        functionalChecks.put("speakerDamage", request.getSpeakerDamage());
        functionalChecks.put("buttonDamage", request.getButtonDamage());
        functionalChecks.put("wifiBluetoothIssue", request.getWifiBluetoothIssue());
        aiPayload.put("functionalChecks", functionalChecks);

        // 3. Call AI Service
        DiagnosticResponse aiResponse;
        try {
            log.info("Calling AI diagnostic service with {} images", images.size());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiApiToken);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(aiPayload, headers);

            String url = aiApiUrl + "/api/diagnose";
            ResponseEntity<DiagnosticResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, DiagnosticResponse.class);
            aiResponse = response.getBody();

        } catch (Exception e) {
            log.error("Failed to call AI diagnostic service", e);
            throw new RuntimeException("AI diagnostic service failed: " + e.getMessage());
        }

        if (aiResponse == null || !aiResponse.isSuccess()) {
            throw new RuntimeException(
                    "AI diagnostic failed: " + (aiResponse != null ? aiResponse.getError() : "Unknown error"));
        }

        // 4. Create internal ProductDiagnostic entity
        ProductDiagnostic diagnostic = new ProductDiagnostic();
        diagnostic.setProductItem(productItem);
        diagnostic.setStaff(null); // Set staff later if needed from request
        if (request.getStaffId() != null) {
            userRepository.findById(request.getStaffId()).ifPresent(diagnostic::setStaff);
        }

        // Set Manual Functional Checks (From Request)
        diagnostic.setMicrophoneDamage(request.getMicrophoneDamage());
        diagnostic.setFrontCameraDamage(request.getFrontCameraDamage());
        diagnostic.setRearCameraDamage(request.getRearCameraDamage());
        diagnostic.setBatteryHealth(request.getBatteryHealth());
        diagnostic.setChargingPortDamage(request.getChargingPortDamage());
        diagnostic.setSpeakerDamage(request.getSpeakerDamage());
        diagnostic.setButtonDamage(request.getButtonDamage());
        diagnostic.setWifiBluetoothIssue(request.getWifiBluetoothIssue());

        // Map AI results (Cosmetic + Calculated Totals) to entity
        DiagnosticResponse.DiagnosticData data = aiResponse.getDiagnostic();
        diagnostic.setScreenCracks(data.getScreenCracks());
        diagnostic.setScratches(data.getScratches());
        diagnostic.setEdgeDings(data.getEdgeDings());
        diagnostic.setDents(data.getDents());
        diagnostic.setDisplayFailure(data.getDisplayFailure());
        diagnostic.setDeadPixels(data.getDeadPixels());
        diagnostic.setDisplayLines(data.getDisplayLines());

        diagnostic.setTotalDepreciation(data.getTotalDepreciation());
        diagnostic.setOverallAssessment(data.getOverallAssessment());

        // Set metadata
        diagnostic.setStatus(DiagnosticStatus.tested);
        diagnostic.setTestDate(LocalDate.now());
        diagnostic.setAdditionalNotes(request.getAdditionalNotes());

        // Store AI analysis details as JSON string
        if (data.getAnalysisDetails() != null) {
            try {
                String analysisJson = objectMapper.writeValueAsString(data.getAnalysisDetails());
                diagnostic.setRepairRecommendations(analysisJson);
            } catch (Exception e) {
                log.error("Failed to serialize analysis details", e);
            }
        }

        // 5. Save to database
        try {
            UserResponse userResponse = userService.getMyInfo();
            if (userResponse != null) {
                User user = userRepository.findById(userResponse.getId()).orElse(null);
                if (user != null) {
                    diagnostic.setCreatedBy(user); // Set creator for history
                }
            }
            diagnostic = diagnosticRepository.save(diagnostic);
            log.info("Diagnostic saved successfully: {}", diagnostic.getId());
        } catch (Exception e) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "Failed to save diagnostic: " + e.getMessage());
        }

        // 6. Convert to DTO and return
        return convertToDTO(diagnostic);
    }

    /**
     * Lấy tất cả diagnostic cho admin (với pagination)
     */
    @Transactional(readOnly = true)
    public Page<ProductDiagnosticDTO> getAllDiagnosticsForAdmin(Pageable pageable, DiagnosticStatus status) {
        Page<ProductDiagnostic> diagnostics;
        if (status != null) {
            diagnostics = diagnosticRepository.findByStatus(status, pageable);
        } else {
            diagnostics = diagnosticRepository.findAll(pageable);
        }
        return diagnostics.map(this::convertToDTO);
    }

    /**
     * Cập nhật trạng thái diagnostic
     */
    @Transactional
    public ProductDiagnosticDTO updateDiagnosticStatus(UUID diagnosticId, DiagnosticStatus status) {
        ProductDiagnostic diagnostic = diagnosticRepository.findById(diagnosticId)
                .orElseThrow(() -> new RuntimeException("Diagnostic not found: " + diagnosticId));
        diagnostic.setStatus(status);
        diagnostic = diagnosticRepository.save(diagnostic);
        return convertToDTO(diagnostic);
    }

    /**
     * Lấy tất cả diagnostic của một product item
     */
    public List<ProductDiagnosticDTO> getDiagnosticsByProductItem(UUID productItemId) {
        List<ProductDiagnostic> diagnostics = diagnosticRepository.findByProductItemId(productItemId);
        return diagnostics.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử diagnostic của user
     */
    public List<ProductDiagnosticDTO> getDiagnosticsByUserId(UUID userId) {
        List<ProductDiagnostic> diagnostics = diagnosticRepository.findByCreatedBy_Id(userId);
        return diagnostics.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(ProductDiagnosticDTO::getTestDate).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Lấy diagnostic mới nhất của một product item
     */
    public Optional<ProductDiagnosticDTO> getLatestDiagnostic(UUID productItemId) {
        return diagnosticRepository.findLatestByProductItemId(productItemId)
                .map(this::convertToDTO);
    }

    /**
     * Lấy diagnostic theo ID
     */
    public ProductDiagnosticDTO getDiagnosticById(UUID diagnosticId) {
        ProductDiagnostic diagnostic = diagnosticRepository.findById(diagnosticId)
                .orElseThrow(() -> new RuntimeException("Diagnostic not found: " + diagnosticId));
        return convertToDTO(diagnostic);
    }

    /**
     * Cập nhật diagnostic (cho phép staff chỉnh sửa)
     */
    @Transactional
    public ProductDiagnosticDTO updateDiagnostic(UUID diagnosticId, ProductDiagnostic updates) {
        ProductDiagnostic diagnostic = diagnosticRepository.findById(diagnosticId)
                .orElseThrow(() -> new RuntimeException("Diagnostic not found: " + diagnosticId));

        // Update fields if provided
        if (updates.getScreenCracks() != null)
            diagnostic.setScreenCracks(updates.getScreenCracks());
        if (updates.getScratches() != null)
            diagnostic.setScratches(updates.getScratches());
        if (updates.getEdgeDings() != null)
            diagnostic.setEdgeDings(updates.getEdgeDings());
        if (updates.getDents() != null)
            diagnostic.setDents(updates.getDents());
        if (updates.getDisplayFailure() != null)
            diagnostic.setDisplayFailure(updates.getDisplayFailure());
        if (updates.getDeadPixels() != null)
            diagnostic.setDeadPixels(updates.getDeadPixels());
        if (updates.getDisplayLines() != null)
            diagnostic.setDisplayLines(updates.getDisplayLines());
        if (updates.getTotalDepreciation() != null)
            diagnostic.setTotalDepreciation(updates.getTotalDepreciation());
        if (updates.getOverallAssessment() != null)
            diagnostic.setOverallAssessment(updates.getOverallAssessment());
        if (updates.getAdditionalNotes() != null)
            diagnostic.setAdditionalNotes(updates.getAdditionalNotes());
        if (updates.getRepairRecommendations() != null)
            diagnostic.setRepairRecommendations(updates.getRepairRecommendations());
        if (updates.getEstimatedRepairCost() != null)
            diagnostic.setEstimatedRepairCost(updates.getEstimatedRepairCost());
        if (updates.getStatus() != null)
            diagnostic.setStatus(updates.getStatus());

        // Functional Checks Updates
        if (updates.getMicrophoneDamage() != null)
            diagnostic.setMicrophoneDamage(updates.getMicrophoneDamage());
        if (updates.getFrontCameraDamage() != null)
            diagnostic.setFrontCameraDamage(updates.getFrontCameraDamage());
        if (updates.getRearCameraDamage() != null)
            diagnostic.setRearCameraDamage(updates.getRearCameraDamage());
        if (updates.getBatteryHealth() != null)
            diagnostic.setBatteryHealth(updates.getBatteryHealth());
        if (updates.getChargingPortDamage() != null)
            diagnostic.setChargingPortDamage(updates.getChargingPortDamage());
        if (updates.getSpeakerDamage() != null)
            diagnostic.setSpeakerDamage(updates.getSpeakerDamage());
        if (updates.getButtonDamage() != null)
            diagnostic.setButtonDamage(updates.getButtonDamage());
        if (updates.getWifiBluetoothIssue() != null)
            diagnostic.setWifiBluetoothIssue(updates.getWifiBluetoothIssue());

        diagnostic = diagnosticRepository.save(diagnostic);
        return convertToDTO(diagnostic);
    }

    /**
     * Xóa diagnostic
     */
    @Transactional
    public void deleteDiagnostic(UUID diagnosticId) {
        diagnosticRepository.deleteById(diagnosticId);
    }

    /**
     * Convert entity to DTO
     */
    private ProductDiagnosticDTO convertToDTO(ProductDiagnostic diagnostic) {
        return ProductDiagnosticDTO.builder()
                .id(diagnostic.getId())
                .productItemId(diagnostic.getProductItem().getId())
                .microphoneDamage(diagnostic.getMicrophoneDamage())
                .frontCameraDamage(diagnostic.getFrontCameraDamage())
                .rearCameraDamage(diagnostic.getRearCameraDamage())
                .batteryHealth(diagnostic.getBatteryHealth())
                .chargingPortDamage(diagnostic.getChargingPortDamage())
                .speakerDamage(diagnostic.getSpeakerDamage())
                .buttonDamage(diagnostic.getButtonDamage())
                .wifiBluetoothIssue(diagnostic.getWifiBluetoothIssue())
                .screenCracks(diagnostic.getScreenCracks())
                .scratches(diagnostic.getScratches())
                .edgeDings(diagnostic.getEdgeDings())
                .dents(diagnostic.getDents())
                .displayFailure(diagnostic.getDisplayFailure())
                .deadPixels(diagnostic.getDeadPixels())
                .displayLines(diagnostic.getDisplayLines())
                .totalDepreciation(diagnostic.getTotalDepreciation())
                .overallAssessment(diagnostic.getOverallAssessment())
                .status(diagnostic.getStatus() != null ? diagnostic.getStatus().getValue() : null)
                .additionalNotes(diagnostic.getAdditionalNotes())
                .testDate(diagnostic.getTestDate())
                .repairRecommendations(diagnostic.getRepairRecommendations())
                .estimatedRepairCost(diagnostic.getEstimatedRepairCost())
                .staffId(diagnostic.getStaff() != null ? diagnostic.getStaff().getId() : null)
                .staffName(diagnostic.getStaff() != null ? diagnostic.getStaff().getFullName() : null)
                .aiAnalysisDetails(diagnostic.getRepairRecommendations()) // Contains JSON of AI analysis
                .build();
    }
}
