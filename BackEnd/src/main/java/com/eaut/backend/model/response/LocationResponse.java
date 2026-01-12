package com.eaut.backend.model.response;

import lombok.*;
import java.util.List;

/**
 * Response DTOs for Vietnam administrative divisions (Provinces, Districts,
 * Wards)
 */
public class LocationResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Province {
        private String idProvince;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class District {
        private String idProvince;
        private String idDistrict;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Commune {
        private String idDistrict;
        private String idCommune;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationData {
        private List<Province> province;
        private List<District> district;
        private List<Commune> commune;
    }
}
