package com.eaut.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemDetailResponse {
    private UUID id;

    // Product info
    private UUID productId;
    private String productName;
    private String name; // Tên biến thể
    private String description; // Mô tả biến thể
    private String productDescription; // Mô tả sản phẩm
    private String brandName;
    private String categoryName;
    private Integer warrantyMonths;

    // Price info
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;
    private Integer qtyAvailable;

    // ================= SCREEN =================
    private Double screenSize;
    private String screenTechnology;
    private String screenResolution;
    private Integer refreshRate;
    private String screenType;
    private String screenFeatures;

    // ================= CAMERA =================
    private String rearCamera;
    private String rearVideo;
    private String rearCameraFeatures;
    private String frontCamera;
    private String frontVideo;

    // ================= CHIP – RAM =================
    private String chipset;
    private String cpu;
    private String gpu;
    private String operatingSystem;

    // ================= KẾT NỐI =================
    private String nfc;
    private String simType;
    private String network;
    private String gps;
    private String wifi;
    private String bluetooth;
    private String chargingPort;

    // ================= PIN & SẠC =================
    private Integer batteryCapacity;
    private Integer chargingPower;
    private String chargingTechnology;

    // ================= KÍCH THƯỚC =================
    private String dimensions;
    private Integer weight;

    // ================= KHÁC =================
    private String waterResistance;
    private String sensors;
    private String releaseTime;

    // Related data
    private List<ProductModelDetailResponse> models;
    private List<ProductMediaResponse> media;
    private List<ProductRatingResponse> ratings;

    // Aggregate rating info
    private Double averageRating;
    private Integer totalRatings;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
