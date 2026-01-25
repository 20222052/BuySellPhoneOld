package com.eaut.backend.service.impl;

import com.eaut.backend.constant.ErrorCode;
import com.eaut.backend.constant.ProductStatus;
import com.eaut.backend.entities.Product;
import com.eaut.backend.entities.ProductColor;
import com.eaut.backend.entities.ProductItem;
import com.eaut.backend.entities.ProductMedia;
import com.eaut.backend.entities.ProductModel;
import com.eaut.backend.entities.ProductRating;
import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.request.ProductColorRequest;
import com.eaut.backend.model.request.ProductItemRequest;
import com.eaut.backend.model.request.ProductMediaRequest;
import com.eaut.backend.model.request.ProductModelRequest;
import com.eaut.backend.model.response.ApiResponse;
import com.eaut.backend.model.response.PagingResponse;
import com.eaut.backend.model.response.ProductItemDetailResponse;
import com.eaut.backend.model.response.ProductItemListResponse;
import com.eaut.backend.model.response.ProductItemResponse;
import com.eaut.backend.repository.ProductColorRepository;
import com.eaut.backend.repository.ProductItemRepository;
import com.eaut.backend.repository.ProductMediaRepository;
import com.eaut.backend.repository.ProductModelRepository;
import com.eaut.backend.repository.ProductRatingRepository;
import com.eaut.backend.repository.ProductRepository;
import com.eaut.backend.service.ProductColorService;
import com.eaut.backend.service.ProductItemService;
import com.eaut.backend.untils.Mapper;
import com.eaut.backend.untils.PagingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductItemServiceImpl implements ProductItemService {

    private final ProductItemRepository productItemRepository;
    private final ProductRepository productRepository;
    private final ProductRatingRepository productRatingRepository;
    private final ProductModelRepository productModelRepository;
    private final ProductMediaRepository productMediaRepository;
    private final ProductColorRepository productColorRepository;
    private final ProductColorService productColorService;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<ProductItemResponse>> findAll(
            String searchText,
            UUID productId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int pageNumber,
            int pageSize) {

        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable = PagingUtils.buildPageable(
                pageNumber,
                pageSize,
                sort,
                "createdAt");

        Page<ProductItem> result = productItemRepository.getAllProductItems(
                pattern,
                productId,
                minPrice,
                maxPrice,
                pageable);

        List<ProductItemResponse> productItems = result.stream()
                .map(Mapper::toProductItemResponse)
                .toList();

        PagingResponse<ProductItemResponse> response = PagingResponse.<ProductItemResponse>builder()
                .items(productItems)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return new ApiResponse<>(
                HttpStatus.OK.value(),
                response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagingResponse<ProductItemListResponse>> findAllForList(
            String searchText,
            UUID productId,
            UUID brandId,
            UUID categoryId,
            ProductStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer isTradeIn,
            String sortBy,
            String sortDir,
            Boolean randomEnabled,
            int pageNumber,
            int pageSize) {

        String pattern = PagingUtils.buildSearchPattern(searchText);

        Pageable pageable;
        // Build sort - for random, we'll shuffle after fetching
        if (Boolean.TRUE.equals(randomEnabled)) {
            // For random, just use default sort by createdAt to fetch data
            pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            // Normal sort
            Sort.Direction direction = (sortDir != null && sortDir.equalsIgnoreCase("ASC"))
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            String sortField = (sortBy != null && !sortBy.isEmpty()) ? sortBy : "createdAt";
            pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField));
        }

        // Query 1: Lấy danh sách productItem, Product, Brand, Category
        Page<ProductItem> result = productItemRepository.findAllWithFilters(
                pattern,
                productId,
                brandId,
                categoryId,
                status,
                minPrice,
                maxPrice,
                isTradeIn,
                pageable);

        // Nếu random enable thì shuffle kết quả
        List<ProductItem> productItems;
        if (Boolean.TRUE.equals(randomEnabled)) {
            productItems = new ArrayList<>(result.getContent());
            Collections.shuffle(productItems);
        } else {
            productItems = result.getContent();
        }

        if (productItems.isEmpty()) {
            PagingResponse<ProductItemListResponse> emptyResponse = PagingResponse.<ProductItemListResponse>builder()
                    .items(Collections.emptyList())
                    .page(result.getNumber())
                    .size(result.getSize())
                    .totalElements(result.getTotalElements())
                    .totalPages(result.getTotalPages())
                    .build();
            return new ApiResponse<>(HttpStatus.OK.value(), emptyResponse);
        }

        // Get IDs for batch queries
        List<UUID> productItemIds = productItems.stream()
                .map(ProductItem::getId)
                .toList();
        List<UUID> productIds = productItems.stream()
                .map(pi -> pi.getProduct().getId())
                .distinct()
                .toList();

        // Query 2: Get primary images for all product items (batch)
        Map<UUID, ProductMedia> primaryImageMap = getPrimaryImagesForProductItems(productItemIds);

        // Query 3: Get rating stats for all products (batch)
        Map<UUID, RatingStats> ratingStatsMap = getRatingStatsForProducts(productIds);

        // Map to response
        List<ProductItemListResponse> responseList = productItems.stream()
                .map(pi -> mapToProductItemListResponse(pi, primaryImageMap, ratingStatsMap))
                .toList();

        PagingResponse<ProductItemListResponse> response = PagingResponse.<ProductItemListResponse>builder()
                .items(responseList)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return new ApiResponse<>(HttpStatus.OK.value(), response);
    }

    /**
     * Get primary images for multiple product items (batch query)
     */
    private Map<UUID, ProductMedia> getPrimaryImagesForProductItems(List<UUID> productItemIds) {
        List<ProductMedia> allMedia = productMediaRepository.findAllByProductItemIdsOrdered(productItemIds);

        // Group by productItemId and take the first one (primary or lowest sort order)
        Map<UUID, ProductMedia> result = new HashMap<>();
        for (ProductMedia media : allMedia) {
            UUID productItemId = media.getProductItem().getId();
            if (!result.containsKey(productItemId)) {
                result.put(productItemId, media);
            }
        }
        return result;
    }

    /**
     * Get rating stats for multiple products (batch query)
     */
    private Map<UUID, RatingStats> getRatingStatsForProducts(List<UUID> productIds) {
        List<Object[]> statsData = productRatingRepository.getRatingStatsByProductIds(productIds);

        Map<UUID, RatingStats> result = new HashMap<>();
        for (Object[] row : statsData) {
            UUID productId = (UUID) row[0];
            Double avgRating = (Double) row[1];
            Long count = (Long) row[2];
            result.put(productId, new RatingStats(avgRating, count.intValue()));
        }
        return result;
    }

    /**
     * Calculate discount percentage
     */
    private Integer calculateDiscountPercent(BigDecimal comparePrice, BigDecimal sellPrice) {
        if (comparePrice == null || sellPrice == null || comparePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }
        if (comparePrice.compareTo(sellPrice) <= 0) {
            return 0;
        }
        BigDecimal discount = comparePrice.subtract(sellPrice);
        BigDecimal percent = discount.multiply(BigDecimal.valueOf(100))
                .divide(comparePrice, 0, RoundingMode.HALF_UP);
        return percent.intValue();
    }

    /**
     * Map ProductItem to ProductItemListResponse
     */
    private ProductItemListResponse mapToProductItemListResponse(
            ProductItem pi,
            Map<UUID, ProductMedia> primaryImageMap,
            Map<UUID, RatingStats> ratingStatsMap) {

        Product product = pi.getProduct();
        ProductMedia primaryImage = primaryImageMap.get(pi.getId());
        RatingStats ratingStats = ratingStatsMap.getOrDefault(
                product.getId(),
                new RatingStats(null, 0));

        // Count models and colors, and calculate total quantity
        int modelCount = pi.getModels() != null ? pi.getModels().size() : 0;
        int colorCount = 0;
        int totalQtyAvailable = 0;
        if (pi.getModels() != null) {
            for (var model : pi.getModels()) {
                if (model.getColors() != null) {
                    colorCount += model.getColors().size();
                    // Sum up quantity from all colors
                    for (var color : model.getColors()) {
                        totalQtyAvailable += color.getQtyAvailable();
                    }
                }
            }
        }

        return ProductItemListResponse.builder()
                .id(pi.getId())
                // ProductItem name (variant)
                .name(pi.getName())
                .description(pi.getDescription())
                .status(String.valueOf(pi.getStatus() == 0 ? ProductStatus.draft
                        : pi.getStatus() == 1 ? ProductStatus.active : ProductStatus.inactive))
                // Product info
                .productId(product.getId())
                .productName(product.getName())
                .productDescription(product.getDescription())
                .productStatus(String.valueOf(pi.getStatus() == 0 ? ProductStatus.draft
                        : pi.getStatus() == 1 ? ProductStatus.active : ProductStatus.inactive))
                // Brand
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .brandLogoUrl(product.getBrand() != null ? product.getBrand().getLogoUrl() : null)
                // Category
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                // Price
                .basePrice(pi.getBasePrice())
                .sellPrice(pi.getSellPrice())
                .comparePrice(pi.getComparePrice())
                .discountPercent(calculateDiscountPercent(pi.getComparePrice(), pi.getSellPrice()))
                // Primary image
                .primaryImageUrl(primaryImage != null ? primaryImage.getUrl() : null)
                .primaryImagePublicId(primaryImage != null ? primaryImage.getPublic_id() : null)
                // Rating
                .averageRating(ratingStats.averageRating)
                .totalRatings(ratingStats.totalRatings)
                // Model & Color counts
                .modelCount(modelCount)
                .colorCount(colorCount)
                .qtyAvailable(totalQtyAvailable)
                .isTradeIn(pi.getIsTradeIn())
                // Warranty
                .warrantyMonths(product.getWarrantyMonths())
                // Timestamps
                .createdAt(pi.getCreatedAt())
                .updatedAt(pi.getModifiedAt())
                .build();
    }

    /**
     * Inner class to hold rating statistics
     */
    private record RatingStats(Double averageRating, Integer totalRatings) {
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItemResponse findById(UUID id) {
        ProductItem productItem = productItemRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));
        return Mapper.toProductItemResponse(productItem);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItemDetailResponse findByIdWithDetails(UUID id) {
        // Query 1: Get ProductItem with Product, Brand, Category
        ProductItem productItem = productItemRepository.findByIdWithProduct(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));

        // Query 2: Get Media separately
        ProductItem productItemWithMedia = productItemRepository.findByIdWithMedia(id)
                .orElse(productItem);
        List<ProductMedia> mediaList = productItemWithMedia.getProductMedia();

        // Query 3: Get Models with Colors
        List<ProductModel> modelsWithColors = productModelRepository.findByProductItemIdWithColors(id);

        // Get ratings for the product (not product item)
        UUID productId = productItem.getProduct().getId();
        List<ProductRating> ratings = productRatingRepository.findByProductId(productId);
        Double averageRating = productRatingRepository.getAverageRatingByProductId(productId);
        Integer totalRatings = productRatingRepository.countByProductId(productId);

        return Mapper.toProductItemDetailResponse(productItem, modelsWithColors, mediaList, ratings, averageRating,
                totalRatings);
    }

    @Override
    @Transactional
    public ProductItemResponse create(ProductItemRequest request) {
        log.info("Creating ProductItem with models, colors and media");

        // Validate required fields
        if (request.getProductId() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product ID is required");
        }
        if (request.getBasePrice() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Base price is required");
        }
        if (request.getSellPrice() == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Sell price is required");
        }

        // Get Product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));

        // 1. Create and save ProductItem first
        ProductItem productItem = Mapper.toProductItem(request, product);
        ProductItem savedProductItem = productItemRepository.save(productItem);
        log.info("ProductItem created: {}", savedProductItem.getId());

        // 2. Create ProductModels với ProductColors
        if (request.getModels() != null && !request.getModels().isEmpty()) {
            createProductModelsWithColors(savedProductItem, request.getModels());
        }

        // 3. Create ProductMedia
        if (request.getMediaList() != null && !request.getMediaList().isEmpty()) {
            createProductMedia(savedProductItem, request.getMediaList());
        }

        return Mapper.toProductItemResponse(savedProductItem);
    }

    @Override
    @Transactional
    public ProductItemResponse update(UUID id, ProductItemRequest request) {
        log.info("Updating ProductItem {} with models, colors and media", id);

        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product item ID is required");
        }

        ProductItem productItem = productItemRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));

        // Update product if provided
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ApplicationException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
            productItem.setProduct(product);
        }

        // Update name (variant name)
        if (request.getName() != null) {
            productItem.setName(request.getName());
        }

        // Update description
        if (request.getDescription() != null) {
            productItem.setDescription(request.getDescription());
        }

        // Update prices
        if (request.getBasePrice() != null) {
            productItem.setBasePrice(request.getBasePrice());
        }
        if (request.getSellPrice() != null) {
            productItem.setSellPrice(request.getSellPrice());
        }
        if (request.getComparePrice() != null) {
            productItem.setComparePrice(request.getComparePrice());
        }

        // ================= SCREEN =================
        if (request.getScreenSize() != null) {
            productItem.setScreenSize(request.getScreenSize());
        }
        if (request.getScreenTechnology() != null) {
            productItem.setScreenTechnology(request.getScreenTechnology());
        }
        if (request.getScreenResolution() != null) {
            productItem.setScreenResolution(request.getScreenResolution());
        }
        if (request.getRefreshRate() != null) {
            productItem.setRefreshRate(request.getRefreshRate());
        }
        if (request.getScreenType() != null) {
            productItem.setScreenType(request.getScreenType());
        }
        if (request.getScreenFeatures() != null) {
            productItem.setScreenFeatures(request.getScreenFeatures());
        }

        // ================= CAMERA =================
        if (request.getRearCamera() != null) {
            productItem.setRearCamera(request.getRearCamera());
        }
        if (request.getRearVideo() != null) {
            productItem.setRearVideo(request.getRearVideo());
        }
        if (request.getRearCameraFeatures() != null) {
            productItem.setRearCameraFeatures(request.getRearCameraFeatures());
        }
        if (request.getFrontCamera() != null) {
            productItem.setFrontCamera(request.getFrontCamera());
        }
        if (request.getFrontVideo() != null) {
            productItem.setFrontVideo(request.getFrontVideo());
        }

        // ================= CHIP – RAM =================
        if (request.getChipset() != null) {
            productItem.setChipset(request.getChipset());
        }
        if (request.getCpu() != null) {
            productItem.setCpu(request.getCpu());
        }
        if (request.getGpu() != null) {
            productItem.setGpu(request.getGpu());
        }
        if (request.getOperatingSystem() != null) {
            productItem.setOperating_system(request.getOperatingSystem());
        }

        // ================= KẾT NỐI =================
        if (request.getNfc() != null) {
            productItem.setNfc(request.getNfc());
        }
        if (request.getSimType() != null) {
            productItem.setSimType(request.getSimType());
        }
        if (request.getNetwork() != null) {
            productItem.setNetwork(request.getNetwork());
        }
        if (request.getGps() != null) {
            productItem.setGps(request.getGps());
        }
        if (request.getWifi() != null) {
            productItem.setWifi(request.getWifi());
        }
        if (request.getBluetooth() != null) {
            productItem.setBluetooth(request.getBluetooth());
        }
        if (request.getChargingPort() != null) {
            productItem.setChargingPort(request.getChargingPort());
        }

        // ================= PIN & SẠC =================
        if (request.getBatteryCapacity() != null) {
            productItem.setBatteryCapacity(request.getBatteryCapacity());
        }
        if (request.getChargingPower() != null) {
            productItem.setChargingPower(request.getChargingPower());
        }
        if (request.getChargingTechnology() != null) {
            productItem.setChargingTechnology(request.getChargingTechnology());
        }

        // ================= KÍCH THƯỚC =================
        if (request.getDimensions() != null) {
            productItem.setDimensions(request.getDimensions());
        }
        if (request.getWeight() != null) {
            productItem.setWeight(request.getWeight());
        }

        // ================= KHÁC =================
        if (request.getWaterResistance() != null) {
            productItem.setWaterResistance(request.getWaterResistance());
        }
        if (request.getSensors() != null) {
            productItem.setSensors(request.getSensors());
        }
        if (request.getReleaseTime() != null) {
            productItem.setReleaseTime(request.getReleaseTime());
        }

        ProductItem updatedProductItem = productItemRepository.save(productItem);
        log.info("ProductItem basic info updated: {}", updatedProductItem.getId());

        // Update ProductModels với ProductColors
        if (request.getModels() != null) {
            updateProductModelsWithColors(updatedProductItem, request.getModels());
        }

        // Update ProductMedia
        if (request.getMediaList() != null) {
            updateProductMedia(updatedProductItem, request.getMediaList());
        }

        return Mapper.toProductItemResponse(updatedProductItem);
    }

    /**
     * Tạo mới ProductModels và ProductColors cho ProductItem
     */
    private void createProductModelsWithColors(ProductItem productItem, List<ProductModelRequest> modelRequests) {
        for (ProductModelRequest modelRequest : modelRequests) {
            // Validate model name
            if (modelRequest.getName() == null || modelRequest.getName().trim().isEmpty()) {
                log.warn("Skipping model without name");
                continue;
            }

            // Create ProductModel
            ProductModel productModel = ProductModel.builder()
                    .productItem(productItem)
                    .name(modelRequest.getName().trim())
                    .ramGb(modelRequest.getRamGb())
                    .romGb(modelRequest.getRomGb())
                    .grade(modelRequest.getGrade())
                    .description(modelRequest.getDescription())
                    .createdAt(OffsetDateTime.now())
                    .build();

            ProductModel savedModel = productModelRepository.save(productModel);
            log.info("ProductModel created: {} for ProductItem: {}", savedModel.getId(), productItem.getId());

            // Create ProductColors for this model
            if (modelRequest.getColors() != null && !modelRequest.getColors().isEmpty()) {
                createProductColors(savedModel, modelRequest.getColors());
            }
        }
    }

    /**
     * Tạo mới ProductColors cho ProductModel
     */
    private void createProductColors(ProductModel productModel, List<ProductColorRequest> colorRequests) {
        for (ProductColorRequest colorRequest : colorRequests) {
            // Validate color name
            if (colorRequest.getName() == null || colorRequest.getName().trim().isEmpty()) {
                log.warn("Skipping color without name");
                throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Color name is required");
            }

            ProductColor productColor = ProductColor.builder()
                    .productModel(productModel)
                    .name(colorRequest.getName().trim())
                    .hexCode(colorRequest.getHexCode())
                    .qtyAvailable(colorRequest.getQtyAvailable() != null ? colorRequest.getQtyAvailable() : 0)
                    .createdAt(OffsetDateTime.now())
                    .build();

            ProductColor savedColor = productColorRepository.save(productColor);
            log.info("ProductColor created: {} for ProductModel: {}", savedColor.getId(), productModel.getId());
        }
    }

    /**
     * Tạo mới ProductMedia cho ProductItem
     */
    private void createProductMedia(ProductItem productItem, List<ProductMediaRequest> mediaRequests) {
        // Tìm ảnh nào được đánh dấu là primary trong request
        boolean hasPrimaryInRequest = mediaRequests.stream().anyMatch(ProductMediaRequest::isPrimary);

        int sortOrder = 0;
        for (ProductMediaRequest mediaRequest : mediaRequests) {
            // Validate URL
            if (mediaRequest.getUrl() == null || mediaRequest.getUrl().trim().isEmpty()) {
                log.warn("Skipping media without URL");
                continue;
            }

            // Ảnh đầu tiên sẽ là primary nếu không có ảnh nào được đánh dấu primary
            boolean shouldBePrimary = (sortOrder == 0 && !hasPrimaryInRequest) || mediaRequest.isPrimary();

            // Nếu có ảnh được đánh dấu primary trước đó, các ảnh sau không được là primary
            if (hasPrimaryInRequest && sortOrder > 0) {
                shouldBePrimary = mediaRequest.isPrimary();
            }

            ProductMedia productMedia = ProductMedia.builder()
                    .productItem(productItem)
                    .url(mediaRequest.getUrl())
                    .public_id(mediaRequest.getPublicId())
                    .type(mediaRequest.getType())
                    .isPrimary(shouldBePrimary)
                    .sortOrder(mediaRequest.getSortOrder() != null ? mediaRequest.getSortOrder() : sortOrder)
                    .createdAt(OffsetDateTime.now())
                    .build();

            ProductMedia savedMedia = productMediaRepository.save(productMedia);
            log.info("ProductMedia created: {} for ProductItem: {} (isPrimary={})",
                    savedMedia.getId(), productItem.getId(), shouldBePrimary);
            sortOrder++;
        }
    }

    /**
     * Cập nhật ProductModels và ProductColors cho ProductItem
     * - Nếu model có id: update
     * - Nếu model không có id: create mới
     * - Các model không có trong request sẽ bị xóa
     */
    private void updateProductModelsWithColors(ProductItem productItem, List<ProductModelRequest> modelRequests) {
        // Lấy danh sách model hiện tại
        List<ProductModel> existingModels = productModelRepository.findByProductItemId(productItem.getId());
        Set<UUID> requestModelIds = new HashSet<>();

        for (ProductModelRequest modelRequest : modelRequests) {
            if (modelRequest.getId() != null) {
                // Update existing model
                requestModelIds.add(modelRequest.getId());
                ProductModel existingModel = existingModels.stream()
                        .filter(m -> m.getId().equals(modelRequest.getId()))
                        .findFirst()
                        .orElse(null);

                if (existingModel != null) {
                    // Update fields
                    if (modelRequest.getName() != null && !modelRequest.getName().trim().isEmpty()) {
                        existingModel.setName(modelRequest.getName().trim());
                    }
                    if (modelRequest.getRamGb() != null) {
                        existingModel.setRamGb(modelRequest.getRamGb());
                    }
                    if (modelRequest.getRomGb() != null) {
                        existingModel.setRomGb(modelRequest.getRomGb());
                    }
                    if (modelRequest.getGrade() != null) {
                        existingModel.setGrade(modelRequest.getGrade());
                    }
                    if (modelRequest.getDescription() != null) {
                        existingModel.setDescription(modelRequest.getDescription());
                    }

                    productModelRepository.save(existingModel);
                    log.info("ProductModel updated: {}", existingModel.getId());

                    // Update colors for this model
                    if (modelRequest.getColors() != null) {
                        updateProductColors(existingModel, modelRequest.getColors());
                    }
                }
            } else {
                // Create new model
                if (modelRequest.getName() != null && !modelRequest.getName().trim().isEmpty()) {
                    ProductModel newModel = ProductModel.builder()
                            .productItem(productItem)
                            .name(modelRequest.getName().trim())
                            .ramGb(modelRequest.getRamGb())
                            .romGb(modelRequest.getRomGb())
                            .grade(modelRequest.getGrade())
                            .description(modelRequest.getDescription())
                            .createdAt(OffsetDateTime.now())
                            .build();

                    ProductModel savedModel = productModelRepository.save(newModel);
                    log.info("ProductModel created: {} for ProductItem: {}", savedModel.getId(), productItem.getId());

                    // Create colors for new model
                    if (modelRequest.getColors() != null && !modelRequest.getColors().isEmpty()) {
                        createProductColors(savedModel, modelRequest.getColors());
                    }
                }
            }
        }

        // Xóa các model không có trong request
        for (ProductModel existingModel : existingModels) {
            if (!requestModelIds.contains(existingModel.getId())) {
                productModelRepository.delete(existingModel);
                log.info("ProductModel deleted: {}", existingModel.getId());
            }
        }
    }

    /**
     * Cập nhật ProductColors cho ProductModel
     */
    private void updateProductColors(ProductModel productModel, List<ProductColorRequest> colorRequests) {
        List<ProductColor> existingColors = productColorRepository.findByProductModelId(productModel.getId());
        Set<UUID> requestColorIds = new HashSet<>();

        for (ProductColorRequest colorRequest : colorRequests) {
            if (colorRequest.getId() != null) {
                // Update existing color
                requestColorIds.add(colorRequest.getId());
                ProductColor existingColor = existingColors.stream()
                        .filter(c -> c.getId().equals(colorRequest.getId()))
                        .findFirst()
                        .orElse(null);

                if (existingColor != null) {
                    if (colorRequest.getName() != null && !colorRequest.getName().trim().isEmpty()) {
                        existingColor.setName(colorRequest.getName().trim());
                    }
                    if (colorRequest.getHexCode() != null) {
                        existingColor.setHexCode(colorRequest.getHexCode());
                    }
                    if (colorRequest.getQtyAvailable() != null) {
                        existingColor.setQtyAvailable(colorRequest.getQtyAvailable());
                    }
                    productColorRepository.save(existingColor);
                    log.info("ProductColor updated: {}", existingColor.getId());
                }
            } else {
                // Create new color
                if (colorRequest.getName() != null && !colorRequest.getName().trim().isEmpty()) {
                    ProductColor newColor = ProductColor.builder()
                            .productModel(productModel)
                            .name(colorRequest.getName().trim())
                            .hexCode(colorRequest.getHexCode())
                            .qtyAvailable(colorRequest.getQtyAvailable() != null ? colorRequest.getQtyAvailable() : 0)
                            .createdAt(OffsetDateTime.now())
                            .build();

                    ProductColor savedColor = productColorRepository.save(newColor);
                    log.info("ProductColor created: {} for ProductModel: {}", savedColor.getId(), productModel.getId());
                }
            }
        }

        // Xóa các color không có trong request
        for (ProductColor existingColor : existingColors) {
            if (!requestColorIds.contains(existingColor.getId())) {
                productColorRepository.delete(existingColor);
                log.info("ProductColor deleted: {}", existingColor.getId());
            }
        }
    }

    /**
     * Cập nhật ProductMedia cho ProductItem
     */
    private void updateProductMedia(ProductItem productItem, List<ProductMediaRequest> mediaRequests) {
        List<ProductMedia> existingMedia = productMediaRepository.findByProductItemId(productItem.getId());
        Set<UUID> requestMediaIds = new HashSet<>();

        // Tìm ảnh nào được đánh dấu là primary trong request
        UUID primaryMediaId = null;
        for (ProductMediaRequest mediaRequest : mediaRequests) {
            if (mediaRequest.isPrimary()) {
                primaryMediaId = mediaRequest.getId();
                break;
            }
        }

        // Nếu không có ảnh nào được đánh dấu primary, chọn ảnh đầu tiên làm primary
        boolean hasPrimary = primaryMediaId != null;
        if (!hasPrimary && !mediaRequests.isEmpty()) {
            primaryMediaId = mediaRequests.get(0).getId();
            hasPrimary = true;
        }

        int sortOrder = 0;
        for (ProductMediaRequest mediaRequest : mediaRequests) {
            // Xác định xem ảnh này có phải là primary không
            boolean shouldBePrimary = hasPrimary &&
                    ((mediaRequest.getId() != null && mediaRequest.getId().equals(primaryMediaId)) ||
                            (mediaRequest.getId() == null && sortOrder == 0 && primaryMediaId == null));

            if (mediaRequest.getId() != null) {
                // Update existing media
                requestMediaIds.add(mediaRequest.getId());
                ProductMedia existingItem = existingMedia.stream()
                        .filter(m -> m.getId().equals(mediaRequest.getId()))
                        .findFirst()
                        .orElse(null);

                if (existingItem != null) {
                    if (mediaRequest.getUrl() != null) {
                        existingItem.setUrl(mediaRequest.getUrl());
                    }
                    if (mediaRequest.getPublicId() != null) {
                        existingItem.setPublic_id(mediaRequest.getPublicId());
                    }
                    if (mediaRequest.getType() != null) {
                        existingItem.setType(mediaRequest.getType());
                    }
                    // Chỉ ảnh được chọn làm primary mới set isPrimary = true
                    existingItem.setPrimary(shouldBePrimary);
                    if (mediaRequest.getSortOrder() != null) {
                        existingItem.setSortOrder(mediaRequest.getSortOrder());
                    }
                    productMediaRepository.save(existingItem);
                    log.info("ProductMedia updated: {} (isPrimary={})", existingItem.getId(), shouldBePrimary);
                }
            } else {
                // Create new media
                if (mediaRequest.getUrl() != null && !mediaRequest.getUrl().trim().isEmpty()) {
                    ProductMedia newMedia = ProductMedia.builder()
                            .productItem(productItem)
                            .url(mediaRequest.getUrl())
                            .public_id(mediaRequest.getPublicId())
                            .type(mediaRequest.getType())
                            .isPrimary(shouldBePrimary)
                            .sortOrder(mediaRequest.getSortOrder() != null ? mediaRequest.getSortOrder() : sortOrder)
                            .createdAt(OffsetDateTime.now())
                            .build();

                    ProductMedia savedMedia = productMediaRepository.save(newMedia);
                    log.info("ProductMedia created: {} for ProductItem: {} (isPrimary={})",
                            savedMedia.getId(), productItem.getId(), shouldBePrimary);
                }
            }
            sortOrder++;
        }

        // Xóa các media không có trong request
        for (ProductMedia existingItem : existingMedia) {
            if (!requestMediaIds.contains(existingItem.getId())) {
                productMediaRepository.delete(existingItem);
                log.info("ProductMedia deleted: {}", existingItem.getId());
            }
        }
    }

    @Override
    @Transactional
    public ProductItemResponse updateStatus(UUID id, ProductStatus status) {
        log.info("Updating status for ProductItem {} to {}", id, status);

        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product item ID is required");
        }

        if (status == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Status is required");
        }

        ProductItem productItem = productItemRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));

        // Update status using the enum code
        productItem.setStatus(status.getCode());
        ProductItem updatedProductItem = productItemRepository.save(productItem);

        log.info("ProductItem status updated: {} -> status={}", id, status);
        return Mapper.toProductItemResponse(updatedProductItem);
    }

    @Override
    @Transactional
    public ProductItemResponse updateTradeIn(UUID id, Integer isTradeIn) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product item ID is required");
        }

        ProductItem productItem = productItemRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));

        productItem.setIsTradeIn(isTradeIn);
        ProductItem updatedProductItem = productItemRepository.save(productItem);

        log.info("ProductItem trade-in status updated: {} -> isTradeIn={}", id, isTradeIn);
        return Mapper.toProductItemResponse(updatedProductItem);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (id == null) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "Product item ID is required");
        }

        ProductItem productItem = productItemRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.NOT_FOUND, "Product item not found"));

        productItemRepository.delete(productItem);
    }
}
