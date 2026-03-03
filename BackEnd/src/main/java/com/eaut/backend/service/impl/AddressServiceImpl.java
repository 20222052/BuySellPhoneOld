package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.Address;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.AddressRequest;
import com.eaut.backend.model.response.AddressResponse;
import com.eaut.backend.repository.AddressRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "User not found with id: " + request.getUserId()));

        String cityName = request.getCityName();
        String districtName = request.getDistrictName();
        String wardName = request.getWardName();

        // Handle empty or null district
        String districtCode = request.getDistrictCode();
        if (districtCode != null && districtCode.trim().isEmpty()) {
            districtCode = null;
        }
        if (districtName != null && districtName.trim().isEmpty()) {
            districtName = null;
        }

        // If this is the first address or marked as default, handle default logic
        List<Address> existingAddresses = addressRepository.findByUserIdAndIsDeleteFalse(request.getUserId());
        boolean shouldBeDefault = request.isDefault() || existingAddresses.isEmpty();

        // If setting as default, unset other defaults
        if (shouldBeDefault) {
            existingAddresses.stream()
                    .filter(Address::isDefault)
                    .forEach(addr -> {
                        addr.setDefault(false);
                        addr.setDelete(false);
                        addressRepository.save(addr);
                    });
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine(request.getAddressLine())
                .cityCode(request.getCityCode())
                .cityName(cityName)
                .districtCode(districtCode)
                .districtName(districtName)
                .wardCode(request.getWardCode())
                .wardName(wardName)
                .isDefault(shouldBeDefault)
                .isWarehouse(request.isWarehouse())
                .build();

        Address saved = addressRepository.save(address);
        log.info("Created address {} for user {}", saved.getId(), user.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Address not found with id: " + addressId));
        if (address.isDelete()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Address not found with id: " + addressId);
        }
        return mapToResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(UUID userId) {
        return addressRepository.findByUserIdAndIsDeleteFalse(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Address not found with id: " + addressId));

        // Verify ownership and deletion status
        if (!address.getUser().getId().equals(request.getUserId()) || address.isDelete()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Address does not belong to this user or is deleted");
        }

        String cityName = request.getCityName();
        String districtName = request.getDistrictName();
        String wardName = request.getWardName();

        // Handle empty or null district
        String districtCode = request.getDistrictCode();
        if (districtCode != null && districtCode.trim().isEmpty()) {
            districtCode = null;
        }
        if (districtName != null && districtName.trim().isEmpty()) {
            districtName = null;
        }

        // Handle default logic
        if (request.isDefault() && !address.isDefault()) {
            addressRepository.findByUserIdAndIsDeleteFalse(request.getUserId()).stream()
                    .filter(Address::isDefault)
                    .forEach(addr -> {
                        addr.setDefault(false);
                        addressRepository.save(addr);
                    });
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCityCode(request.getCityCode());
        address.setCityName(cityName);
        address.setDistrictCode(districtCode);
        address.setDistrictName(districtName);
        address.setWardCode(request.getWardCode());
        address.setWardName(wardName);
        address.setDefault(request.isDefault());
        address.setWarehouse(request.isWarehouse());

        Address updated = addressRepository.save(address);
        log.info("Updated address {}", addressId);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Address not found with id: " + addressId));

        if (address.isDelete()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Address not found with id: " + addressId);
        }

        UUID userId = address.getUser().getId();
        boolean wasDefault = address.isDefault();

        address.setDelete(true);
        address.setDefault(false);
        addressRepository.save(address);
        log.info("Deleted address {}", addressId);

        // If deleted address was default, set another as default
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdAndIsDeleteFalse(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
                log.info("Set address {} as new default", newDefault.getId());
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByIdAndUserIdAndIsDeleteFalse(addressId, userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Address not found or does not belong to user"));

        // Unset current default
        addressRepository.findDefaultByUserId(userId).ifPresent(currentDefault -> {
            currentDefault.setDefault(false);
            addressRepository.save(currentDefault);
        });

        // Set new default
        address.setDefault(true);
        Address updated = addressRepository.save(address);
        log.info("Set address {} as default for user {}", addressId, userId);

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddress(UUID userId) {
        return addressRepository.findDefaultByUserId(userId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    private AddressResponse mapToResponse(Address address) {
        StringBuilder fullAddress = new StringBuilder();
        fullAddress.append(address.getAddressLine());
        if (address.getWardName() != null)
            fullAddress.append(", ").append(address.getWardName());
        if (address.getDistrictName() != null && !address.getDistrictName().trim().isEmpty())
            fullAddress.append(", ").append(address.getDistrictName());
        if (address.getCityName() != null && !address.getCityName().trim().isEmpty())
            fullAddress.append(", ").append(address.getCityName());

        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .wardCode(address.getWardCode())
                .districtCode(address.getDistrictCode())
                .cityCode(address.getCityCode())
                .wardName(address.getWardName())
                .districtName(address.getDistrictName())
                .cityName(address.getCityName())
                .fullAddress(fullAddress.toString())
                .isDefault(address.isDefault())
                .build();
    }
}
