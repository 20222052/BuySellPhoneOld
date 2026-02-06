package com.eaut.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.eaut.backend.model.response.CloudinaryResponse;
import com.eaut.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    @Async("taskExecutor")
    public CompletableFuture<CloudinaryResponse> uploadImages(MultipartFile file) throws Exception {
        // Compress image before uploading to reduce upload time
        byte[] compressedBytes = compressImage(file, 0.6f);

        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "products", // 👈 folder Cloudinary
                "resource_type", "image",
                "quality", "auto", // tối ưu dung lượng
                "fetch_format", "auto" // auto webp / jpg
        );

        Map uploadResult = cloudinary.uploader()
                .upload(compressedBytes, options);

        return CompletableFuture.completedFuture(
                CloudinaryResponse.builder()
                        .publicId((String) uploadResult.get("public_id"))
                        .secureUrl((String) uploadResult.get("secure_url"))
                        .build());
    }

    /**
     * Compress image before uploading to cloud
     * 
     * @param file    MultipartFile to compress
     * @param quality Compression quality (0.0f to 1.0f, where 1.0f is highest
     *                quality)
     * @return Compressed image as byte array
     * @throws IOException if image reading/writing fails
     */
    private byte[] compressImage(MultipartFile file, float quality) throws IOException {
        BufferedImage image = null;

        try {
            image = ImageIO.read(file.getInputStream());
        } catch (Exception e) {
            // Trường hợp ImageIO không đọc được (ví dụ: CMYK colorspace)
            log.warn("ImageIO.read failed: {}. Using original file bytes.", e.getMessage());
            return file.getBytes();
        }

        // Nếu ImageIO.read trả về null (không hỗ trợ format)
        if (image == null) {
            log.warn("ImageIO.read returned null. Using original file bytes.");
            return file.getBytes();
        }

        // Chuyển đổi ảnh có alpha channel hoặc colorspace khác về RGB
        // Điều này xử lý các trường hợp như PNG với transparency hoặc ảnh CMYK
        if (image.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgbImage = new BufferedImage(
                    image.getWidth(),
                    image.getHeight(),
                    BufferedImage.TYPE_INT_RGB);
            // Vẽ ảnh gốc lên ảnh RGB mới (với nền trắng cho các pixel trong suốt)
            java.awt.Graphics2D g = rgbImage.createGraphics();
            g.setColor(java.awt.Color.WHITE);
            g.fillRect(0, 0, image.getWidth(), image.getHeight());
            g.drawImage(image, 0, 0, null);
            g.dispose();
            image = rgbImage;
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageWriter jpgWriter = ImageIO.getImageWritersByFormatName("jpg").next();

        ImageWriteParam param = jpgWriter.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality); // 0.6f = 60% quality

        jpgWriter.setOutput(ImageIO.createImageOutputStream(baos));
        jpgWriter.write(null, new IIOImage(image, null, null), param);
        jpgWriter.dispose();

        return baos.toByteArray();
    }

    @Override
    public void rollbackUploadedImages(List<String> publicIds) {
        for (String publicId : publicIds) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public void deleteImage(String publicId) {
        try {
            Map result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "auto"));

            String status = (String) result.get("result");

            if (!"ok".equals(status) && !"not found".equals(status)) {
                throw new IllegalStateException(
                        "Cloudinary delete failed, status=" + status);
            }
        } catch (Exception e) {
            throw new RuntimeException("Delete image failed: " + publicId, e);
        }
    }

    public void deleteProductItemImages(UUID productItemId) {
        try {
            cloudinary.api().deleteResourcesByPrefix(
                    "products/" + productItemId,
                    ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.error("Failed to delete images of productItem={}", productItemId, e);
        }
    }

}
