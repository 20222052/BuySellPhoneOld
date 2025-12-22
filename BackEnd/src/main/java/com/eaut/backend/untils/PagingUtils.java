package com.eaut.backend.untils;


import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PagingUtils {

    // Xử lý search pattern
    public static String buildSearchPattern(String input) {
        if (input == null) return null;
        input = input.trim();
        return input.isEmpty() ? null : "%" + input.toLowerCase() + "%";
    }

    // Tạo Pageable
    public static Pageable buildPageable(int pageNumber, int pageSize, String sort, String... sortFields) {
        Sort.Direction direction = (sort != null && sort.equalsIgnoreCase("ASC"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortFields));
    }
}
