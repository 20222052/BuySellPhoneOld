package com.eaut.backend.controller;

import com.eaut.backend.model.request.AddressRequest;
import com.eaut.backend.model.response.AddressResponse;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/addresses")
public class AddressController {

    private final AddressService addressService;

    /**
     * Create a new address
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(@RequestBody AddressRequest request) {
        log.info("Creating address for user: {}", request.getUserId());
        AddressResponse response = addressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(HttpStatus.CREATED.value(), "Địa chỉ được tạo thành công", true, response));
    }

    /**
     * Get address by ID
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(@PathVariable UUID addressId) {
        AddressResponse response = addressService.getAddressById(addressId);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Thành công", true, response));
    }

    /**
     * Get all addresses for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddressesByUserId(@PathVariable UUID userId) {
        List<AddressResponse> response = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Addresses retrieved successfully", true, response));
    }

    /**
     * Get default address for a user
     */
    @GetMapping("/user/{userId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> getDefaultAddress(@PathVariable UUID userId) {
        AddressResponse response = addressService.getDefaultAddress(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Default address retrieved", true, response));
    }

    /**
     * Update an address
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable UUID addressId,
            @RequestBody AddressRequest request) {
        log.info("Updating address: {}", addressId);
        AddressResponse response = addressService.updateAddress(addressId, request);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Address updated successfully", true, response));
    }

    /**
     * Delete an address
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable UUID addressId) {
        log.info("Deleting address: {}", addressId);
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Address deleted successfully", true, null));
    }

    /**
     * Set an address as default
     */
    @PutMapping("/user/{userId}/default/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @PathVariable UUID userId,
            @PathVariable UUID addressId) {
        log.info("Setting default address {} for user {}", addressId, userId);
        AddressResponse response = addressService.setDefaultAddress(userId, addressId);
        return ResponseEntity.ok(
                new ApiResponse<>(HttpStatus.OK.value(), "Default address set successfully", true, response));
    }
}
