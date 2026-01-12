package com.eaut.backend.service;

import com.eaut.backend.model.request.AddressRequest;
import com.eaut.backend.model.response.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    /**
     * Create a new address for user
     */
    AddressResponse createAddress(AddressRequest request);

    /**
     * Get address by ID
     */
    AddressResponse getAddressById(UUID addressId);

    /**
     * Get all addresses for a user
     */
    List<AddressResponse> getAddressesByUserId(UUID userId);

    /**
     * Update an address
     */
    AddressResponse updateAddress(UUID addressId, AddressRequest request);

    /**
     * Delete an address
     */
    void deleteAddress(UUID addressId);

    /**
     * Set an address as default for user
     */
    AddressResponse setDefaultAddress(UUID userId, UUID addressId);

    /**
     * Get default address for user
     */
    AddressResponse getDefaultAddress(UUID userId);
}
