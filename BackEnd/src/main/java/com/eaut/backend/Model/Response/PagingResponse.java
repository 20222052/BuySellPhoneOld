package com.eaut.backend.Model.Response;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;


/**
 * Lớp đại diện cho dữ liệu phản hồi phân trang (paging response).
 * @param <T> kiểu dữ liệu của danh sách items.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PagingResponse<T> {

    /**
     * Danh sách các phần tử trong trang hiện tại.
     * Đây là dữ liệu bạn muốn trả về (ví dụ: danh sách User, Product...).
     */
    private List<T> items;

    /**
     * Số trang hiện tại (chỉ số trang).
     * - Bắt đầu từ 0 nếu bạn dùng Pageable của Spring.
     * - Nếu muốn bắt đầu từ 1 thì cần tự chỉnh sửa khi map dữ liệu.
     */
    private int page;

    /**
     * Số lượng phần tử tối đa trong mỗi trang.
     * Đây là giá trị pageSize truyền lên từ client.
     */
    private int size;

    /**
     * Tổng số phần tử trong toàn bộ dữ liệu, không chỉ trong trang hiện tại.
     * Dùng để tính toán phân trang ở phía frontend.
     */
    private long totalElements;

    /**
     * Tổng số trang có thể có.
     * Tính bằng: totalPages = ceil(totalElements / size).
     */
    private int totalPages;
}



