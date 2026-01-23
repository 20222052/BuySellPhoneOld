package com.eaut.backend.service.impl;

import com.eaut.backend.model.response.LocationResponse.*;
import com.eaut.backend.service.LocationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final ObjectMapper objectMapper;

    private List<Province> provinces = new ArrayList<>();
    private List<District> districts = new ArrayList<>();
    private List<Commune> communes = new ArrayList<>();

    private Map<String, String> provinceNameMap = new HashMap<>();
    private Map<String, String> districtNameMap = new HashMap<>();
    private Map<String, String> communeNameMap = new HashMap<>();

    @PostConstruct
    public void loadLocationData() {
        try {
            ClassPathResource resource = new ClassPathResource("static/64TinhThanh.json");
            InputStream inputStream = resource.getInputStream();
            JsonNode root = objectMapper.readTree(inputStream);

            // Load provinces
            JsonNode provinceNode = root.get("province");
            if (provinceNode != null && provinceNode.isArray()) {
                provinces = StreamSupport.stream(provinceNode.spliterator(), false)
                        .map(node -> Province.builder()
                                .idProvince(node.get("idProvince").asText())
                                .name(node.get("name").asText())
                                .build())
                        .collect(Collectors.toList());

                provinceNameMap = provinces.stream()
                        .collect(Collectors.toMap(Province::getIdProvince, Province::getName));
            }

            // Load districts
            JsonNode districtNode = root.get("district");
            if (districtNode != null && districtNode.isArray()) {
                districts = StreamSupport.stream(districtNode.spliterator(), false)
                        .map(node -> District.builder()
                                .idProvince(node.get("idProvince").asText())
                                .idDistrict(node.get("idDistrict").asText())
                                .name(node.get("name").asText())
                                .build())
                        .collect(Collectors.toList());

                districtNameMap = districts.stream()
                        .collect(Collectors.toMap(District::getIdDistrict, District::getName));
            }

            // Load communes
            JsonNode communeNode = root.get("commune");
            if (communeNode != null && communeNode.isArray()) {
                communes = StreamSupport.stream(communeNode.spliterator(), false)
                        .map(node -> Commune.builder()
                                .idDistrict(node.get("idDistrict").asText())
                                .idCommune(node.get("idCommune").asText())
                                .name(node.get("name").asText())
                                .build())
                        .collect(Collectors.toList());

                communeNameMap = communes.stream()
                        .collect(Collectors.toMap(Commune::getIdCommune, Commune::getName));
            }

            log.info("Loaded {} provinces, {} districts, {} communes",
                    provinces.size(), districts.size(), communes.size());

        } catch (IOException e) {
            log.error("Failed to load location data from JSON file", e);
        }
    }

    @Override
    public List<Province> getAllProvinces() {
        return provinces;
    }

    @Override
    public List<District> getDistrictsByProvince(String provinceCode) {
        return districts.stream()
                .filter(d -> d.getIdProvince().equals(provinceCode))
                .collect(Collectors.toList());
    }

    @Override
    public List<Commune> getCommunesByDistrict(String districtCode) {
        return communes.stream()
                .filter(c -> c.getIdDistrict().equals(districtCode))
                .collect(Collectors.toList());
    }

    @Override
    public String getProvinceName(String provinceCode) {
        return provinceNameMap.getOrDefault(provinceCode, null);
    }

    @Override
    public String getDistrictName(String districtCode) {
        return districtNameMap.getOrDefault(districtCode, null);
    }

    @Override
    public String getCommuneName(String communeCode) {
        return communeNameMap.getOrDefault(communeCode, null);
    }
}
