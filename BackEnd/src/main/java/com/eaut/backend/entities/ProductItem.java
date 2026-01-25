package com.eaut.backend.entities;

// === Lombok & JPA imports ===
import com.eaut.backend.entities.baseEntity.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItem extends AuditBase {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @PrePersist
    public void prePersist() {
        if (id == null)
            id = UUID.randomUUID();
    }

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "is_trade_in", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer isTradeIn;

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductModel> models = new ArrayList<>();

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductMedia> productMedia = new ArrayList<>();

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice; // Giá gốc

    @Column(name = "sell_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellPrice; // Giá bán

    @Column(name = "compare_price", precision = 12, scale = 2)
    private BigDecimal comparePrice; // Giá so sánh

    @Column(name = "status", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer status; // Trạng thái: 0 - draft - nháp, 1 - Active - đang bán, 2 inactive - ngừng bán

    // ================= SCREEN =================
    @Column(name = "screen_size")
    private Double screenSize; // Kích thước màn hình: 6.9 (inch)
    @Column(name = "screen_technology")
    private String screenTechnology; // Công nghệ màn hình: Super Retina XDR
    @Column(name = "screen_resolution")
    private String screenResolution; // Độ phân giải màn hình: 2868 x 1320
    @Column(name = "refresh_rate")
    private Integer refreshRate; // Tần số quét màn hình: 120 (Hz)
    @Column(name = "screen_type")
    private String screenType; // Kiểu màn hình: Dynamic Island

    // Các tính năng màn hình (Always On, HDR, True Tone, ...)
    @Column(name = "screen_features")
    private String screenFeatures;

    // =========================
    // Camera
    // =========================

    // Thông số camera sau
    @Column(name = "rear_camera")
    private String rearCamera;

    // Khả năng quay video camera sau
    @Column(name = "rear_video")
    private String rearVideo;

    // Tính năng camera sau (zoom, night mode, HDR…)
    @Column(name = "rear_camera_features")
    private String rearCameraFeatures;

    // Thông số camera trước
    @Column(name = "front_camera")
    private String frontCamera;

    // Khả năng quay video camera trước
    @Column(name = "front_video")
    private String frontVideo;

    // =========================
    // Chip – RAM – Bộ nhớ
    // =========================

    // Chip xử lý – VD: Apple A19 Pro
    @Column(name = "chipset")
    private String chipset;

    // CPU – VD: CPU 6 lõi (2 hiệu năng + 4 tiết kiệm điện)
    @Column(name = "cpu")
    private String cpu;

    // GPU – VD: GPU 6 lõi
    @Column(name = "gpu")
    private String gpu;

    // Hệ điều hành – VD: iOS 26
    @Column(name = "operating_system")
    private String operating_system;

    // =========================
    // Kết nối & giao tiếp
    // =========================

    // Có hỗ trợ NFC hay không
    @Column(name = "nfc")
    private String nfc;

    // Loại SIM – VD: Dual SIM, eSIM
    @Column(name = "sim_type")
    private String simType;

    // Mạng hỗ trợ – VD: 5G
    @Column(name = "network")
    private String network;

    // Hệ thống định vị – GPS, GLONASS, Galileo...
    @Column(name = "gps")
    private String gps;

    // Chuẩn Wi-Fi – VD: Wi-Fi 7
    @Column(name = "wifi")
    private String wifi;

    // Chuẩn Bluetooth – VD: Bluetooth 6
    @Column(name = "bluetooth")
    private String bluetooth;

    // Cổng sạc – VD: USB Type-C
    @Column(name = "charging_port")
    private String chargingPort;

    // =========================
    // Pin & sạc
    // =========================

    // Dung lượng pin (mAh)
    @Column(name = "battery_capacity")
    private Integer batteryCapacity;

    // Công suất sạc (W)
    @Column(name = "charging_power")
    private Integer chargingPower;

    // Công nghệ sạc (MagSafe, Qi2, sạc nhanh...)
    @Column(name = "charging_technology")
    private String chargingTechnology;

    // =========================
    // Kích thước & trọng lượng
    // =========================

    // Kích thước – VD: 163.4 x 78 x 8.75 mm
    @Column(name = "dimensions")
    private String dimensions;

    // Trọng lượng (gram)
    @Column(name = "weight")
    private Integer weight;

    // =========================
    // Thông tin khác
    // =========================

    // Chuẩn kháng nước/bụi – VD: IP68
    @Column(name = "water_resistance")
    private String waterResistance;

    // Các loại cảm biến
    @Column(name = "sensors")
    private String sensors;

    // Thời điểm ra mắt – VD: 09/2025
    @Column(name = "release_time")
    private String releaseTime;

    @OneToMany(mappedBy = "productItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductDiagnostic> diagnostics = new ArrayList<>();
}