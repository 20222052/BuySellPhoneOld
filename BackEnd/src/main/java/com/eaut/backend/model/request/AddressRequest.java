package com.eaut.backend.model.request;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {
    private UUID userId;
    private String fullName;
    private String phone;
    private String addressLine;

    // Location codes (from JSON file)
    private String cityCode;
    private String districtCode;
    private String wardCode;

    // Location names (will be auto-filled from JSON if codes provided)
    private String cityName;
    private String districtName;
    private String wardName;

    private boolean isDefault;
    private boolean isWarehouse;
}
