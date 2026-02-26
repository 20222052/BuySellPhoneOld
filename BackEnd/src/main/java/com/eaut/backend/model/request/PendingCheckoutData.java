package com.eaut.backend.model.request;

import com.eaut.backend.constant.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingCheckoutData implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID userId;
    private UUID addressId;
    private PaymentMethod paymentMethod;
    private String note;

    // Thêm các thông tin tính toán sẵn cho mã QR
    private String orderCode;
    private BigDecimal total;
    private OffsetDateTime createdAt;
}
