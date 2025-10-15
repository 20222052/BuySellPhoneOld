package com.eaut.backend.untils;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // ========== SUCCESS CODES (2xx) ==========
    SUCCESS("SUCCESS_200", "Operation completed successfully", HttpStatus.OK),
    CREATED("SUCCESS_201", "Resource created successfully", HttpStatus.CREATED),
    
    // ========== CLIENT ERROR CODES (4xx) ==========
    // Validation Errors (400x)
    BAD_REQUEST("ERR_400", "Bad request", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT("ERR_4001", "Invalid format", HttpStatus.BAD_REQUEST),
    FIELD_REQUIRED("ERR_4002", "Required field is missing", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER("ERR_4003", "Invalid parameter provided", HttpStatus.BAD_REQUEST),
    VALUES_OUT_OF_RANGE("ERR_4004", "Values are out of allowed range", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("ERR_4005", "Invalid request", HttpStatus.BAD_REQUEST),
    
    // Authentication Errors (401x)
    UNAUTHORIZED("ERR_401", "Unauthorized access", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("ERR_4011", "Invalid username or password", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("ERR_4012", "Access token has expired", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("ERR_4013", "Invalid access token", HttpStatus.UNAUTHORIZED),
    UNABLE_TOKEN_CREATED("ERR_4014", "Unable to create access token", HttpStatus.UNAUTHORIZED),
    
    // Authorization Errors (403x)
    FORBIDDEN("ERR_403", "Access forbidden", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PRIVILEGES("ERR_4031", "Insufficient privileges to perform this action", HttpStatus.FORBIDDEN),
    
    // Not Found Errors (404x)
    NOT_FOUND("ERR_404", "Resource not found", HttpStatus.NOT_FOUND),
    RESOURCE_NOT_FOUND("ERR_4040", "Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("ERR_4041", "User not found", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("ERR_4042", "Product not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND("ERR_4043", "Order not found", HttpStatus.NOT_FOUND),
    
    // Conflict Errors (409x)
    CONFLICT("ERR_409", "Resource conflict", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("ERR_4091", "Email address is already registered", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS("ERR_4092", "Phone number is already registered", HttpStatus.CONFLICT),
    USERNAME_ALREADY_EXISTS("ERR_4093", "Username is already taken", HttpStatus.CONFLICT),
    
    // Validation Errors (422x)
    UNPROCESSABLE_ENTITY("ERR_422", "Unprocessable entity", HttpStatus.UNPROCESSABLE_ENTITY),
    EMAIL_INVALID("ERR_4221", "Invalid email format", HttpStatus.UNPROCESSABLE_ENTITY),
    EMAIL_HAS_BEEN_USED("ERR_4222", "Email has been used", HttpStatus.UNPROCESSABLE_ENTITY),
    PHONE_INVALID("ERR_4223", "Invalid phone number format", HttpStatus.UNPROCESSABLE_ENTITY),
    PHONE_NUMBER_INVALID("ERR_4224", "Phone number invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_NOT_STRONG("ERR_4225", "Password not strong enough", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_TOO_WEAK("ERR_4226", "Password does not meet security requirements", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_INVALID("ERR_4227", "Password invalid", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_NOT_MATCH("ERR_4228", "Passwords do not match", HttpStatus.UNPROCESSABLE_ENTITY),
    DATE_INVALID("ERR_4229", "Invalid date format", HttpStatus.UNPROCESSABLE_ENTITY),
    
    // ========== PASSCODE/OTP ERRORS (Bổ sung từ danh sách cũ) ==========
    PASSCODE_NOT_MATCH("ERR_4231", "Passcode does not match", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_HAS_BEEN_USED("ERR_4232", "Passcode has been used", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_EXPIRED("ERR_4233", "Passcode has expired", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_INVALID("ERR_4234", "Invalid passcode format", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_TOO_MANY_ATTEMPTS("ERR_4235", "Too many passcode attempts", HttpStatus.TOO_MANY_REQUESTS),
    
    // ========== ACCOUNT STATUS ERRORS (Bổ sung) ==========
    ACCOUNT_LOCKED("ERR_4236", "Account is locked", HttpStatus.FORBIDDEN),
    ACCOUNT_SUSPENDED("ERR_4237", "Account is suspended", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_VERIFIED("ERR_4238", "Account is not verified", HttpStatus.FORBIDDEN),
    ACCOUNT_EXPIRED("ERR_4239", "Account has expired", HttpStatus.FORBIDDEN),
    
    // ========== FILE/UPLOAD ERRORS (Bổ sung) ==========
    FILE_TOO_LARGE("ERR_4241", "File size exceeds limit", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_TYPE_NOT_SUPPORTED("ERR_4242", "File type not supported", HttpStatus.UNPROCESSABLE_ENTITY),
    FILE_UPLOAD_FAILED("ERR_4243", "File upload failed", HttpStatus.BAD_REQUEST),
    IMAGE_INVALID("ERR_4244", "Invalid image format", HttpStatus.UNPROCESSABLE_ENTITY),
    
    // ========== RATE LIMITING (Bổ sung) ==========
    TOO_MANY_REQUESTS("ERR_429", "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    
    // ========== SERVER ERROR CODES (5xx) ==========
    INTERNAL_SERVER_ERROR("ERR_500", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("ERR_503", "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    DATABASE_ERROR("ERR_5001", "Database connection error", HttpStatus.INTERNAL_SERVER_ERROR),
    EXTERNAL_SERVICE_ERROR("ERR_5002", "External service error", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_PROCESSING_ERROR("ERR_5003", "File processing error", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_SERVICE_ERROR("ERR_5004", "Email service error", HttpStatus.INTERNAL_SERVER_ERROR),
    SMS_SERVICE_ERROR("ERR_5005", "SMS service error", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // ========== BUSINESS LOGIC ERRORS (6xx) ==========
    BUSINESS_LOGIC_ERROR("ERR_600", "Business logic violation", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK("ERR_6001", "Insufficient product stock", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED("ERR_6002", "Order cannot be cancelled at this stage", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED("ERR_6003", "Payment processing failed", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS("ERR_6004", "Invalid order status transition", HttpStatus.BAD_REQUEST),
    
    // ========== PRODUCT/INVENTORY ERRORS (Bổ sung cho hệ thống bán hàng) ==========
    PRODUCT_OUT_OF_STOCK("ERR_6005", "Product is out of stock", HttpStatus.BAD_REQUEST),
    PRODUCT_DISCONTINUED("ERR_6006", "Product has been discontinued", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY("ERR_6007", "Invalid quantity requested", HttpStatus.BAD_REQUEST),
    PRICE_CHANGED("ERR_6008", "Product price has changed", HttpStatus.BAD_REQUEST),
    
    // ========== CART/CHECKOUT ERRORS (Bổ sung) ==========
    CART_EMPTY("ERR_6009", "Shopping cart is empty", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND("ERR_6010", "Item not found in cart", HttpStatus.NOT_FOUND),
    CHECKOUT_FAILED("ERR_6011", "Checkout process failed", HttpStatus.BAD_REQUEST),
    
    // ========== SHIPPING/ADDRESS ERRORS (Bổ sung) ==========
    INVALID_ADDRESS("ERR_6012", "Invalid shipping address", HttpStatus.BAD_REQUEST),
    SHIPPING_NOT_AVAILABLE("ERR_6013", "Shipping not available to this location", HttpStatus.BAD_REQUEST),
    
    // ========== PROMOTION/DISCOUNT ERRORS (Bổ sung) ==========
    COUPON_INVALID("ERR_6014", "Invalid coupon code", HttpStatus.BAD_REQUEST),
    COUPON_EXPIRED("ERR_6015", "Coupon has expired", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_USED("ERR_6016", "Coupon has already been used", HttpStatus.BAD_REQUEST),
    DISCOUNT_NOT_APPLICABLE("ERR_6017", "Discount not applicable", HttpStatus.BAD_REQUEST),
    
    // ========== TRADE-IN ERRORS (Bổ sung cho hệ thống thu cũ đổi mới) ==========
    TRADEIN_NOT_ELIGIBLE("ERR_6018", "Device not eligible for trade-in", HttpStatus.BAD_REQUEST),
    TRADEIN_QUOTE_EXPIRED("ERR_6019", "Trade-in quote has expired", HttpStatus.BAD_REQUEST),
    DEVICE_CONDITION_MISMATCH("ERR_6020", "Device condition does not match description", HttpStatus.BAD_REQUEST),
    
    // ========== OTP / VERIFICATION ERRORS ==========
    // OTP đã được gửi thành công tới người dùng (thường trả về sau thao tác gửi)
    OTP_SENT("ERR_4250", "OTP sent successfully", HttpStatus.OK),

    // Lỗi khi nhà cung cấp (SMS/Email) trả về lỗi, không gửi được OTP
    OTP_DELIVERY_FAILED("ERR_4251", "Failed to deliver OTP (provider error)", HttpStatus.SERVICE_UNAVAILABLE),

    // Đã vượt quá số lần được phép gửi lại OTP trong giới hạn quy định trong này (resend limit)
    OTP_RESEND_LIMIT_REACHED("ERR_4252", "OTP resend limit reached", HttpStatus.TOO_MANY_REQUESTS),

    // Yêu cầu gửi lại quá sớm — phải chờ cooldown giữa hai lần gửi (thường dùng khi có resendCooldownSeconds)
    OTP_RESEND_COOLDOWN("ERR_4253", "Must wait before requesting another OTP", HttpStatus.TOO_MANY_REQUESTS),

    // OTP có định dạng không hợp lệ (ví dụ: độ dài sai, chứa ký tự không cho phép)
    OTP_INVALID_FORMAT("ERR_4254", "Invalid OTP format", HttpStatus.UNPROCESSABLE_ENTITY),

    // OTP không hợp lệ chung (dùng cho trường hợp không khớp / không đúng theo business rule)
    OTP_INVALID("ERR_4255", "Invalid OTP", HttpStatus.UNPROCESSABLE_ENTITY),

    // Mã OTP nhập vào không khớp (thường trả về khi verify thất bại)
    OTP_MISMATCH("ERR_4256", "OTP does not match", HttpStatus.UNPROCESSABLE_ENTITY),

    // Quá nhiều lần thử xác thực OTP (vượt ngưỡng maxAttempts) — áp dụng throttle/lockout
    OTP_TOO_MANY_ATTEMPTS("ERR_4257", "Too many OTP verification attempts", HttpStatus.TOO_MANY_REQUESTS),

    // OTP đã được sử dụng trước đó và không thể sử dụng lại (expireOnUse = true)
    OTP_ALREADY_USED("ERR_4258", "OTP has already been used", HttpStatus.UNPROCESSABLE_ENTITY),

    // OTP đã hết hạn theo TTL/expiration — yêu cầu gửi lại mã mới
    OTP_EXPIRED("ERR_4259", "OTP has expired", HttpStatus.UNPROCESSABLE_ENTITY);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}