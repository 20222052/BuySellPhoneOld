package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.entities.CartItem;
import com.eaut.backend.entities.ProductColor;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductModel;
import com.eaut.backend.entities.User;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.CartRequest;
import com.eaut.backend.model.response.CartResponse;
import com.eaut.backend.repository.CartItemRepository;
import com.eaut.backend.repository.ProductColorRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductColorRepository productColorRepository;
    private final com.eaut.backend.service.ProductItemService productItemService;

    @Override
    @Transactional
    public CartResponse addToCart(CartRequest request) {
        // 1. Validate User
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "User not found with id: " + request.getUserId()));

        // 2. Validate ProductColor
        ProductColor productColor = productColorRepository.findById(request.getProductColorId())
                .orElseThrow(
                        () -> new ApplicationException(ErrorCode.BAD_REQUEST,
                                "ProductColor not found with id: " + request.getProductColorId()));

        // 3. Determine Price
        // Path: ProductColor -> ProductModel -> ProductItem -> sellPrice
        ProductModel productModel = productColor.getProductModel();
        if (productModel == null) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "ProductModel not found for color id: " + request.getProductColorId());
        }
        ProductItem productItem = productModel.getProductItem();
        if (productItem == null) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "ProductItem not found for model id: " + productModel.getId());
        }

        BigDecimal unitPrice = productItem.getSellPrice();
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO; // Handle edge case or throw exception
        }

        // 4. Check if item exists in cart
        Optional<CartItem> existingCartItemOpt = cartItemRepository.findByUserAndProductColorId(user,
                request.getProductColorId());

        CartItem cartItem;
        if (existingCartItemOpt.isPresent()) {
            // Update existing
            cartItem = existingCartItemOpt.get();
            int newQty = cartItem.getQty() + request.getQuantity();

            if (newQty > productColor.getQtyAvailable()) {
                throw new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Quantity exceeds available stock. Available: " + productColor.getQtyAvailable());
            }

            cartItem.setQty(newQty);
            cartItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(newQty)));
        } else {
            // Create new
            int requestedQty = request.getQuantity();
            if (requestedQty > productColor.getQtyAvailable()) {
                throw new ApplicationException(ErrorCode.BAD_REQUEST,
                        "Quantity exceeds available stock. Available: " + productColor.getQtyAvailable());
            }

            cartItem = CartItem.builder()
                    .user(user)
                    .productColorId(request.getProductColorId())
                    .qty(requestedQty)
                    .unitPrice(unitPrice)
                    .totalPrice(unitPrice.multiply(BigDecimal.valueOf(requestedQty)))
                    .createdAt(java.time.OffsetDateTime.now())
                    .build();
        }

        // 5. Save
        CartItem savedItem = cartItemRepository.save(cartItem);

        // 6. Return Response
        return mapToResponse(savedItem, productColor, productModel, productItem, unitPrice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartResponse> getCartByUserId(java.util.UUID userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        return cartItems.stream()
                .map(item -> {
                    ProductColor productColor = productColorRepository.findById(item.getProductColorId()).orElse(null);
                    ProductModel productModel = (productColor != null) ? productColor.getProductModel() : null;
                    ProductItem productItem = (productModel != null) ? productModel.getProductItem() : null;
                    BigDecimal unitPrice = (productItem != null) ? productItem.getSellPrice() : BigDecimal.ZERO;

                    if (productColor == null || productModel == null || productItem == null) {
                        return CartResponse.builder()
                                .id(item.getId())
                                .userId(item.getUser().getId())
                                .productColorId(item.getProductColorId())
                                .quantity(item.getQty())
                                .totalPrice(item.getTotalPrice())
                                .productName("Unknown Product")
                                .build();
                    }

                    return mapToResponse(item, productColor, productModel, productItem, unitPrice);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(java.util.UUID cartItemId,
            com.eaut.backend.model.request.CartUpdateRequest request) {

        // Handle delete if quantity <= 0
        if (request.getQuantity() <= 0) {
            deleteCartItem(cartItemId);
            return null; // Controller should handle this or return a deleted status
        }

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST,
                        "CartItem not found with id: " + cartItemId));

        ProductColor productColor = productColorRepository.findById(cartItem.getProductColorId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.BAD_REQUEST, "ProductColor not found"));
        ProductModel productModel = productColor.getProductModel();
        ProductItem productItem = productModel.getProductItem();
        BigDecimal unitPrice = productItem.getSellPrice();

        // Check stock
        if (request.getQuantity() > productColor.getQtyAvailable()) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST,
                    "Quantity exceeds available stock. Available: " + productColor.getQtyAvailable());
        }

        cartItem.setQty(request.getQuantity());
        cartItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(request.getQuantity())));

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToResponse(savedItem, productColor, productModel, productItem, unitPrice);
    }

    @Override
    @Transactional
    public void deleteCartItem(java.util.UUID cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new ApplicationException(ErrorCode.BAD_REQUEST, "CartItem not found with id: " + cartItemId);
        }
        cartItemRepository.deleteById(cartItemId);
    }

    private CartResponse mapToResponse(CartItem cartItem, ProductColor productColor, ProductModel productModel,
            ProductItem productItem, BigDecimal unitPrice) {
        com.eaut.backend.model.response.ProductItemDetailResponse detail = productItemService
                .findByIdWithDetails(productItem.getId());

        return CartResponse.builder()
                .id(cartItem.getId())
                .userId(cartItem.getUser().getId())
                .productColorId(cartItem.getProductColorId())
                .productName(productItem.getName())
                .productModelName(productModel.getName())
                .colorName(productColor.getName())
                .quantity(cartItem.getQty())
                .unitPrice(unitPrice)
                .totalPrice(cartItem.getTotalPrice())
                .productDetail(detail)
                .build();
    }
}
