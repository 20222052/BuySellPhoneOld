package com.eaut.backend.model.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String addressLine;
    private String wardCode;
    private String districtCode;
    private String cityCode;
    private String wardName;
    private String districtName;
    private String cityName;
    private String fullAddress; // Combined address string
    private boolean isDefault;
}
