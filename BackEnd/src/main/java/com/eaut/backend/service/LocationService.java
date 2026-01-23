package com.eaut.backend.service;

import com.eaut.backend.model.response.LocationResponse.*;

import java.util.List;

/**
 * Service for Vietnam administrative divisions (64 provinces/cities)
 */
public interface LocationService {

    /**
     * Get all provinces/cities
     */
    List<Province> getAllProvinces();

    /**
     * Get districts by province code
     */
    List<District> getDistrictsByProvince(String provinceCode);

    /**
     * Get communes/wards by district code
     */
    List<Commune> getCommunesByDistrict(String districtCode);

    /**
     * Get province name by code
     */
    String getProvinceName(String provinceCode);

    /**
     * Get district name by code
     */
    String getDistrictName(String districtCode);

    /**
     * Get commune/ward name by code
     */
    String getCommuneName(String communeCode);
}
