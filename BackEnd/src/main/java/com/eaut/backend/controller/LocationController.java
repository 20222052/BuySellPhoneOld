package com.eaut.backend.controller;

import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.LocationResponse.*;
import com.eaut.backend.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/locations")
public class LocationController {

    private final LocationService locationService;

    /**
     * Get all provinces/cities (63 provinces)
     */
    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<List<Province>>> getAllProvinces() {
        List<Province> provinces = locationService.getAllProvinces();
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Provinces retrieved successfully", true, provinces));
    }

    /**
     * Get districts by province code
     */
    @GetMapping("/provinces/{provinceCode}/districts")
    public ResponseEntity<ApiResponse<List<District>>> getDistrictsByProvince(@PathVariable String provinceCode) {
        List<District> districts = locationService.getDistrictsByProvince(provinceCode);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Districts retrieved successfully", true, districts));
    }

    /**
     * Get communes/wards by district code
     */
    @GetMapping("/districts/{districtCode}/wards")
    public ResponseEntity<ApiResponse<List<Commune>>> getWardsByDistrict(@PathVariable String districtCode) {
        List<Commune> communes = locationService.getCommunesByDistrict(districtCode);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Wards retrieved successfully", true, communes));
    }
}
