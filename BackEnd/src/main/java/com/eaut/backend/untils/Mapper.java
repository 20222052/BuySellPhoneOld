package com.eaut.backend.untils;

import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.constant.TradeinStatus;
import com.eaut.backend.entities.*;
import com.eaut.backend.model.request.BrandRequest;
import com.eaut.backend.model.request.CategoryRequest;
import com.eaut.backend.model.request.ProductColorRequest;
import com.eaut.backend.model.request.ProductItemRequest;
import com.eaut.backend.model.request.ProductRequest;
import com.eaut.backend.model.request.RegisterRequest;
import com.eaut.backend.model.response.BrandResponse;
import com.eaut.backend.model.response.BlogResponse;
import com.eaut.backend.model.response.CommentResponse;
import com.eaut.backend.model.response.CategoryResponse;
import com.eaut.backend.model.response.ProductColorResponse;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductItemResponse;
import com.eaut.backend.model.response.ProductMediaResponse;
import com.eaut.backend.model.response.ProductModelDetailResponse;
import com.eaut.backend.model.response.ProductRatingResponse;
import com.eaut.backend.model.response.ProductResponse;
import com.eaut.backend.model.response.UserResponse;

import com.eaut.backend.constant.UserStatus;

import static com.eaut.backend.untils.BcryptUtils.passwordEncoder;

public class Mapper {

        // Comment Mappers

        /**
         * Map Comment entity → CommentResponse (không kèm replies)
         * Dùng khi map từng reply đơn lẻ (tránh đệ quy vô hạn)
         */
        public static CommentResponse toCommentResponse(Comment comment) {
                if (comment == null)
                        return null;
                return CommentResponse.builder()
                                .id(comment.getId())
                                .content(comment.getContent())
                                .userId(comment.getUser() != null ? comment.getUser().getId().toString() : null)
                                .userFullName(comment.getUser() != null ? comment.getUser().getFullName() : null)
                                .userAvatar(comment.getUser() != null ? comment.getUser().getAvatarUrl() : null)
                                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                                .createdAt(comment.getCreatedAt())
                                .status(comment.getStatus())
                                .build();
        }

        /**
         * Map Comment entity → CommentResponse kèm danh sách replies (chỉ 1 cấp)
         * Dùng khi lấy danh sách comment gốc của blog
         */
        public static CommentResponse toCommentResponseWithReplies(Comment comment) {
                if (comment == null)
                        return null;
                CommentResponse response = toCommentResponse(comment);
                if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                        response.setReplies(
                                        comment.getReplies().stream()
                                                        .filter(r -> "ACTIVE".equals(r.getStatus()))
                                                        .map(Mapper::toCommentResponse)
                                                        .toList());
                }
                return response;
        }

        public static User ToUser(RegisterRequest registerRequest) {
                User user = new User();
                user.setFullName(registerRequest.getFullName());
                user.setGender(registerRequest.getGender());
                user.setBirthDate(registerRequest.getBirthDate());
                user.setEmail(registerRequest.getEmail());
                user.setPhone(registerRequest.getPhone());
                user.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Encode password
                user.setStatus(UserStatus.active);
                return user;
        }

        public static UserResponse toUserReponse(User user) {
                return new UserResponse(user);
        }

        public static RegisterRequest toRegisterRequest(User user) {
                RegisterRequest registerRequest = new RegisterRequest();
                registerRequest.setFullName(user.getFullName());
                registerRequest.setGender(user.getGender());
                registerRequest.setBirthDate(user.getBirthDate());
                registerRequest.setEmail(user.getEmail());
                registerRequest.setPhone(user.getPhone());
                registerRequest.setPassword(user.getPassword());
                return registerRequest;
        }

        public static CategoryResponse toCategoryResponse(Category category) {
                new CategoryResponse();
                return CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .description(category.getDescription())
                                .image(category.getImage())
                                .isActive(category.isActive())
                                .createdAt(category.getCreatedAt())
                                .updatedAt(category.getModifiedAt())
                                .build();
        }

        public static Category toCategory(CategoryRequest request) {
                new Category();
                return Category.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .image(request.getImage())
                                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                                .build();
        }

        public static BrandResponse toBrandResponse(Brand brand) {
                new BrandResponse();
                return BrandResponse.builder()
                                .id(brand.getId())
                                .name(brand.getName())
                                .logoUrl(brand.getLogoUrl())
                                .build();
        }

        public static Brand toBrand(BrandRequest request) {
                new Brand();
                return Brand.builder()
                                .name(request.getName())
                                .logoUrl(request.getLogoUrl())
                                .build();
        }

        public static BlogResponse toBlogResponse(Blog blog) {
                BlogResponse response = BlogResponse.builder()
                                .id(blog.getId())
                                .title(blog.getTitle())
                                .content(blog.getContent())
                                .imageUrl(blog.getImageUrl())
                                .author(blog.getAuthor())
                                .viewCount(blog.getViewCount())
                                .build();
                response.setCreatedAt(blog.getCreatedAt());
                response.setModifiedAt(blog.getModifiedAt());
                response.setCreatedBy(blog.getCreatedBy());
                response.setCreatedBy(blog.getModifiedBy());
                return response;
        }

        public static ProductColorResponse toProductColorResponse(ProductColor productColor) {
                new ProductColorResponse();
                return ProductColorResponse.builder()
                                .id(productColor.getId())
                                .name(productColor.getName())
                                .hexCode(productColor.getHexCode())
                                .qtyAvailable(productColor.getQtyAvailable())
                                .build();
        }

        public static ProductColor toProductColor(ProductColorRequest request) {
                new ProductColor();
                return ProductColor.builder()
                                .name(request.getName())
                                .hexCode(request.getHexCode())
                                .qtyAvailable(request.getQtyAvailable() != null ? request.getQtyAvailable() : 0)
                                .build();
        }

        // Product Mappers
        public static ProductResponse toProductResponse(Product product) {
                return ProductResponse.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .description(product.getDescription())
                                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                                .warrantyMonths(product.getWarrantyMonths())
                                .status(product.getStatus())
                                .createdAt(product.getCreatedAt())
                                .updatedAt(product.getModifiedAt())
                                .build();
        }

        public static Product toProduct(ProductRequest request, Brand brand, Category category) {
                return Product.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .brand(brand)
                                .category(category)
                                .warrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 0)
                                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.active)
                                .build();
        }

        // ProductItem Mappers
        public static ProductItemResponse toProductItemResponse(ProductItem productItem) {
                return ProductItemResponse.builder()
                                .id(productItem.getId())
                                .productId(productItem.getProduct() != null ? productItem.getProduct().getId() : null)
                                .productName(productItem.getProduct() != null ? productItem.getProduct().getName()
                                                : null)
                                .name(productItem.getName())
                                .description(productItem.getDescription())
                                .basePrice(productItem.getBasePrice())
                                .sellPrice(productItem.getSellPrice())
                                .comparePrice(productItem.getComparePrice())
                                .createdAt(productItem.getCreatedAt())
                                .updatedAt(productItem.getModifiedAt())
                                .build();
        }

        public static ProductItem toProductItem(ProductItemRequest request, Product product) {
                return ProductItem.builder()
                                .product(product)
                                .name(request.getName())
                                .description(request.getDescription())
                                .status(ProductStatus.draft.getCode())
                                .basePrice(request.getBasePrice())
                                .sellPrice(request.getSellPrice())
                                .comparePrice(request.getComparePrice())
                                // Screen
                                .screenSize(request.getScreenSize())
                                .screenTechnology(request.getScreenTechnology())
                                .screenResolution(request.getScreenResolution())
                                .refreshRate(request.getRefreshRate())
                                .screenType(request.getScreenType())
                                .screenFeatures(request.getScreenFeatures())
                                // Camera
                                .rearCamera(request.getRearCamera())
                                .rearVideo(request.getRearVideo())
                                .rearCameraFeatures(request.getRearCameraFeatures())
                                .frontCamera(request.getFrontCamera())
                                .frontVideo(request.getFrontVideo())
                                // Chip
                                .chipset(request.getChipset())
                                .cpu(request.getCpu())
                                .gpu(request.getGpu())
                                .operating_system(request.getOperatingSystem())
                                // Connectivity
                                .nfc(request.getNfc())
                                .simType(request.getSimType())
                                .network(request.getNetwork())
                                .gps(request.getGps())
                                .wifi(request.getWifi())
                                .bluetooth(request.getBluetooth())
                                .chargingPort(request.getChargingPort())
                                // Battery
                                .batteryCapacity(request.getBatteryCapacity())
                                .chargingPower(request.getChargingPower())
                                .chargingTechnology(request.getChargingTechnology())
                                // Dimensions
                                .dimensions(request.getDimensions())
                                .weight(request.getWeight())
                                // Other
                                .waterResistance(request.getWaterResistance())
                                .sensors(request.getSensors())
                                .releaseTime(request.getReleaseTime())
                                .isTradeIn(0)
                                .build();
        }

        // ProductMedia Mapper
        public static ProductMediaResponse toProductMediaResponse(ProductMedia media) {
                return ProductMediaResponse.builder()
                                .id(media.getId())
                                .productItemId(media.getProductItem() != null ? media.getProductItem().getId() : null)
                                .url(media.getUrl())
                                .publicId(media.getPublic_id())
                                .type(media.getType())
                                .isPrimary(media.isPrimary())
                                .sortOrder(media.getSortOrder())
                                .build();
        }

        // ProductModel Detail Mapper (with colors)
        public static ProductModelDetailResponse toProductModelDetailResponse(ProductModel model) {
                return ProductModelDetailResponse.builder()
                                .id(model.getId())
                                .productItemId(model.getProductItem() != null ? model.getProductItem().getId() : null)
                                .name(model.getName())
                                .ramGb(model.getRamGb())
                                .romGb(model.getRomGb())
                                .grade(model.getGrade())
                                .description(model.getDescription())
                                .colors(model.getColors() != null
                                                ? model.getColors().stream().map(Mapper::toProductColorResponse)
                                                                .toList()
                                                : null)
                                .createdAt(model.getCreatedAt())
                                .build();
        }

        // ProductRating Mapper
        public static ProductRatingResponse toProductRatingResponse(ProductRating rating) {
                return ProductRatingResponse.builder()
                                .id(rating.getId())
                                .productId(rating.getProduct() != null ? rating.getProduct().getId() : null)
                                .userId(rating.getUser() != null ? rating.getUser().getId() : null)
                                .userName(rating.getUser() != null ? rating.getUser().getFullName() : null)
                                .orderId(rating.getOrder() != null ? rating.getOrder().getId() : null)
                                .rating(rating.getRating())
                                .content(rating.getContent())
                                .createdAt(rating.getCreatedAt())
                                .build();
        }

        // ProductItem Detail Mapper (with all relations - separate lists)
        public static ProductItemDetailResponse toProductItemDetailResponse(
                        ProductItem productItem,
                        java.util.List<ProductModel> models,
                        java.util.List<ProductMedia> media,
                        java.util.List<ProductRating> ratings,
                        Double averageRating,
                        Integer totalRatings) {

                Product product = productItem.getProduct();

                // Calculate total quantity from all colors in all models
                int totalQtyAvailable = 0;
                if (models != null) {
                        for (var model : models) {
                                if (model.getColors() != null) {
                                        for (var color : model.getColors()) {
                                                totalQtyAvailable += color.getQtyAvailable();
                                        }
                                }
                        }
                }

                return ProductItemDetailResponse.builder()
                                .id(productItem.getId())
                                // Product info
                                .productId(product != null ? product.getId() : null)
                                .productName(product != null ? product.getName() : null)
                                .name(productItem.getName())
                                .description(productItem.getDescription())
                                .productDescription(product != null ? product.getDescription() : null)
                                .brandName(product != null && product.getBrand() != null ? product.getBrand().getName()
                                                : null)
                                .categoryName(product != null && product.getCategory() != null
                                                ? product.getCategory().getName()
                                                : null)
                                .warrantyMonths(product != null ? product.getWarrantyMonths() : null)
                                .isTradeIn(productItem.getIsTradeIn())
                                // Price info
                                .basePrice(productItem.getBasePrice())
                                .sellPrice(productItem.getSellPrice())
                                .comparePrice(productItem.getComparePrice())
                                .qtyAvailable(totalQtyAvailable)
                                // Screen specs
                                .screenSize(productItem.getScreenSize())
                                .screenTechnology(productItem.getScreenTechnology())
                                .screenResolution(productItem.getScreenResolution())
                                .refreshRate(productItem.getRefreshRate())
                                .screenType(productItem.getScreenType())
                                .screenFeatures(productItem.getScreenFeatures())
                                // Camera specs
                                .rearCamera(productItem.getRearCamera())
                                .rearVideo(productItem.getRearVideo())
                                .rearCameraFeatures(productItem.getRearCameraFeatures())
                                .frontCamera(productItem.getFrontCamera())
                                .frontVideo(productItem.getFrontVideo())
                                // Chip specs
                                .chipset(productItem.getChipset())
                                .cpu(productItem.getCpu())
                                .gpu(productItem.getGpu())
                                .operatingSystem(productItem.getOperating_system())
                                // Connectivity specs
                                .nfc(productItem.getNfc())
                                .simType(productItem.getSimType())
                                .network(productItem.getNetwork())
                                .gps(productItem.getGps())
                                .wifi(productItem.getWifi())
                                .bluetooth(productItem.getBluetooth())
                                .chargingPort(productItem.getChargingPort())
                                // Battery specs
                                .batteryCapacity(productItem.getBatteryCapacity())
                                .chargingPower(productItem.getChargingPower())
                                .chargingTechnology(productItem.getChargingTechnology())
                                // Dimensions
                                .dimensions(productItem.getDimensions())
                                .weight(productItem.getWeight())
                                // Other specs
                                .waterResistance(productItem.getWaterResistance())
                                .sensors(productItem.getSensors())
                                .releaseTime(productItem.getReleaseTime())
                                // Related data (from separate queries)
                                .models(models != null
                                                ? models.stream().map(Mapper::toProductModelDetailResponse).toList()
                                                : null)
                                .media(media != null
                                                ? media.stream().map(Mapper::toProductMediaResponse).toList()
                                                : null)
                                .ratings(ratings != null
                                                ? ratings.stream().map(Mapper::toProductRatingResponse).toList()
                                                : null)
                                // Aggregate rating
                                .averageRating(averageRating)
                                .totalRatings(totalRatings)
                                // Timestamps
                                .createdAt(productItem.getCreatedAt())
                                .updatedAt(productItem.getModifiedAt())
                                .build();
        }
}
