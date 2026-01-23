package com.eaut.backend.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductItemRequest {
    private UUID productId;
    private String name; // Tên biến thể (tùy chọn)
    private String description; // Mô tả biến thể (tùy chọn)
    private BigDecimal basePrice;
    private BigDecimal sellPrice;
    private BigDecimal comparePrice;

    // ================= SCREEN =================
    private Double screenSize; // Kích thước màn hình (inch)
    private String screenTechnology; // Công nghệ màn hình: Super Retina XDR
    private String screenResolution; // Độ phân giải màn hình: 2868 x 1320
    private Integer refreshRate; // Tần số quét màn hình (Hz)
    private String screenType; // Kiểu màn hình: Dynamic Island
    private String screenFeatures; // Tính năng màn hình (Always On, HDR, True Tone...)

    // ================= CAMERA =================
    private String rearCamera; // Thông số camera sau
    private String rearVideo; // Khả năng quay video camera sau
    private String rearCameraFeatures; // Tính năng camera sau
    private String frontCamera; // Thông số camera trước
    private String frontVideo; // Khả năng quay video camera trước

    // ================= CHIP – RAM =================
    private String chipset; // Chip xử lý: Apple A19 Pro
    private String cpu; // CPU: CPU 6 lõi
    private String gpu; // GPU: GPU 6 lõi
    private String operatingSystem; // Hệ điều hành: iOS 26

    // ================= KẾT NỐI =================
    private String nfc; // Có hỗ trợ NFC hay không
    private String simType; // Loại SIM: Dual SIM, eSIM
    private String network; // Mạng hỗ trợ: 5G
    private String gps; // Hệ thống định vị
    private String wifi; // Chuẩn Wi-Fi: Wi-Fi 7
    private String bluetooth; // Chuẩn Bluetooth: Bluetooth 6
    private String chargingPort; // Cổng sạc: USB Type-C

    // ================= PIN & SẠC =================
    private Integer batteryCapacity; // Dung lượng pin (mAh)
    private Integer chargingPower; // Công suất sạc (W)
    private String chargingTechnology; // Công nghệ sạc

    // ================= KÍCH THƯỚC =================
    private String dimensions; // Kích thước: 163.4 x 78 x 8.75 mm
    private Integer weight; // Trọng lượng (gram)

    // ================= KHÁC =================
    private String waterResistance; // Chuẩn kháng nước/bụi: IP68
    private String sensors; // Các loại cảm biến
    private String releaseTime; // Thời điểm ra mắt: 09/2025

    // List models để cascade create/update (mỗi model có thể chứa list colors)
    private List<ProductModelRequest> models;

    // List media để cascade create/update
    private List<ProductMediaRequest> mediaList;
}
