package com.eaut.backend.service.AI_ChatBot;

import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductModelDetailResponse;
import com.eaut.backend.model.response.ProductColorResponse;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class ProductFlatteningService {

    /**
     * Chuyển đổi một ProductItemDetailResponse phức tạp thành đoạn văn bản mô tả
     * duy nhất
     * để BAAI/bge-m3 có thể hiểu và tìm kiếm.
     */
    public String flattenProductToString(ProductItemDetailResponse item) {
        StringBuilder sb = new StringBuilder();

        // 1. Thông tin cơ bản
        if (item.getProductName() == null) {
            throw new IllegalStateException("ProductItem must have a Product");
        }

        sb.append("Tên sản phẩm: ").append(item.getProductName()).append(" ").append(item.getName()).append(". ");

        if (item.getBrandName() != null) {
            sb.append("Thương hiệu: ").append(item.getBrandName()).append(". ");
        }

        if (item.getCategoryName() != null) {
            sb.append("Danh mục: ").append(item.getCategoryName()).append(". ");
        }

        // 2. Giá cả
        sb.append("Giá bán hiện tại: ").append(item.getSellPrice()).append(" VNĐ. ");
        if (item.getComparePrice() != null) {
            sb.append("Giá gốc: ").append(item.getComparePrice()).append(" VNĐ. ");
        }

        // 3. Biến thể và cấu hình (RAM/ROM/Màu)
        if (item.getModels() != null && !item.getModels().isEmpty()) {
            sb.append("Các phiên bản cấu hình: ");
            for (ProductModelDetailResponse model : item.getModels()) {
                sb.append("[").append(model.getName())
                        .append(" - RAM: ").append(model.getRamGb()).append("GB")
                        .append(", ROM: ").append(model.getRomGb()).append("GB");

                // Màu sắc
                if (model.getColors() != null && !model.getColors().isEmpty()) {
                    String colors = model.getColors().stream()
                            .map(ProductColorResponse::getName)
                            .collect(Collectors.joining(", "));
                    sb.append(", Màu: ").append(colors);
                }
                sb.append("]. ");
            }
        }

        // 4. Thông số màn hình
        if (item.getScreenSize() != null) {
            sb.append("Màn hình: ").append(item.getScreenSize()).append(" inch");

            if (item.getScreenTechnology() != null) {
                sb.append(", ").append(item.getScreenTechnology());
            }
            if (item.getScreenResolution() != null) {
                sb.append(", độ phân giải ").append(item.getScreenResolution());
            }
            if (item.getRefreshRate() != null) {
                sb.append(", tần số quét ").append(item.getRefreshRate()).append("Hz");
            }
            if (item.getScreenType() != null) {
                sb.append(", ").append(item.getScreenType());
            }
            sb.append(". ");
        }

        if (item.getScreenFeatures() != null) {
            sb.append("Tính năng màn hình: ").append(item.getScreenFeatures()).append(". ");
        }

        // 5. Camera
        if (item.getRearCamera() != null) {
            sb.append("Camera sau: ").append(item.getRearCamera());
            if (item.getRearVideo() != null) {
                sb.append(", quay video ").append(item.getRearVideo());
            }
            if (item.getRearCameraFeatures() != null) {
                sb.append(", ").append(item.getRearCameraFeatures());
            }
            sb.append(". ");
        }

        if (item.getFrontCamera() != null) {
            sb.append("Camera trước: ").append(item.getFrontCamera());
            if (item.getFrontVideo() != null) {
                sb.append(", quay video ").append(item.getFrontVideo());
            }
            sb.append(". ");
        }

        // 6. Chip và hiệu năng
        if (item.getChipset() != null) {
            sb.append("Chip: ").append(item.getChipset());
            if (item.getCpu() != null) {
                sb.append(", ").append(item.getCpu());
            }
            if (item.getGpu() != null) {
                sb.append(", ").append(item.getGpu());
            }
            sb.append(". ");
        }

        if (item.getOperatingSystem() != null) {
            sb.append("Hệ điều hành: ").append(item.getOperatingSystem()).append(". ");
        }

        // 7. Kết nối
        StringBuilder connectivity = new StringBuilder();
        if (item.getNetwork() != null) {
            connectivity.append(item.getNetwork());
        }
        if (item.getSimType() != null) {
            if (connectivity.length() > 0)
                connectivity.append(", ");
            connectivity.append(item.getSimType());
        }
        if (item.getWifi() != null) {
            if (connectivity.length() > 0)
                connectivity.append(", ");
            connectivity.append(item.getWifi());
        }
        if (item.getBluetooth() != null) {
            if (connectivity.length() > 0)
                connectivity.append(", ");
            connectivity.append(item.getBluetooth());
        }
        if (item.getNfc() != null) {
            if (connectivity.length() > 0)
                connectivity.append(", ");
            connectivity.append("NFC " + item.getNfc());
        }
        if (connectivity.length() > 0) {
            sb.append("Kết nối: ").append(connectivity).append(". ");
        }

        if (item.getChargingPort() != null) {
            sb.append("Cổng sạc: ").append(item.getChargingPort()).append(". ");
        }

        // 8. Pin
        if (item.getBatteryCapacity() != null) {
            sb.append("Pin: ").append(item.getBatteryCapacity()).append("mAh");
            if (item.getChargingPower() != null) {
                sb.append(", sạc ").append(item.getChargingPower()).append("W");
            }
            if (item.getChargingTechnology() != null) {
                sb.append(", ").append(item.getChargingTechnology());
            }
            sb.append(". ");
        }

        // 9. Kích thước và trọng lượng
        if (item.getDimensions() != null) {
            sb.append("Kích thước: ").append(item.getDimensions());
            if (item.getWeight() != null) {
                sb.append(", nặng ").append(item.getWeight()).append("g");
            }
            sb.append(". ");
        } else if (item.getWeight() != null) {
            sb.append("Trọng lượng: ").append(item.getWeight()).append("g. ");
        }

        // 10. Tính năng khác
        if (item.getWaterResistance() != null) {
            sb.append("Kháng nước/bụi: ").append(item.getWaterResistance()).append(". ");
        }

        if (item.getSensors() != null) {
            sb.append("Cảm biến: ").append(item.getSensors()).append(". ");
        }

        if (item.getGps() != null) {
            sb.append("Định vị: ").append(item.getGps()).append(". ");
        }

        if (item.getReleaseTime() != null) {
            sb.append("Thời gian ra mắt: ").append(item.getReleaseTime()).append(". ");
        }

        // 11. Bảo hành
        if (item.getWarrantyMonths() != null) {
            sb.append("Bảo hành: ").append(item.getWarrantyMonths()).append(" tháng. ");
        }

        return sb.toString();

    }
}

// =============================
// 4. Quy trình xử lý Fallback (Chuyển người)
//
// Trong module AI (Python/LangChain) hoặc Service xử lý logic Chat, bạn cần cài
// đặt ngưỡng (Threshold).
//
// Logic Flow (Giả mã):
//
// Python pseudocode:
// def handle_user_query(user_query, session_id):
// # 1. Tìm kiếm context
// docs_with_score = vector_db.similarity_search_with_score(user_query, k=3)
//
// # 2. Kiểm tra độ tin cậy (Giả sử ChromaDB trả về distance, càng nhỏ càng tốt,
// hoặc score càng cao càng tốt)
// # Ví dụ BGE-M3 cosine similarity score (0 đến 1)
// best_score = docs_with_score[0][1]
//
// THRESHOLD_CONFIDENCE = 0.65 # Ngưỡng tự quy định
//
// if best_score < THRESHOLD_CONFIDENCE:
// # AI không tìm thấy sản phẩm nào liên quan -> Chuyển người
// kafka_producer.send('chat.human_request', {
// 'session_id': session_id,
// 'reason': 'Low confidence score',
// 'query': user_query
// })
// return "Xin lỗi, tôi chưa tìm thấy thông tin chính xác cho câu hỏi này. Tôi
// sẽ nối máy tới nhân viên tư vấn ngay ạ!"
//
// # 3. Nếu score tốt -> Gọi LLM HuggingFace sinh câu trả lời
// context = format_docs(docs_with_score)
// response = llm_chain.invoke(context, user_query)
//
// # 4. Kiểm tra xem LLM có từ chối trả lời không
// if "tôi không biết" in response.lower() or "không có thông tin" in
// response.lower():
// kafka_producer.send('chat.human_request', { ... })
//
// return response
