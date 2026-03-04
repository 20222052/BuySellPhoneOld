package com.eaut.backend.constant;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // ========== SUCCESS CODES (2xx) ==========
    SUCCESS("SUCCESS_200", "Thao tác hoàn thành thành công", HttpStatus.OK),
    CREATED("SUCCESS_201", "Tài nguyên được tạo thành công", HttpStatus.CREATED),

    // ========== CLIENT ERROR CODES (4xx) ==========
    // Validation Errors (400x)
    BAD_REQUEST("ERR_400", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT("ERR_4001", "Định dạng không hợp lệ", HttpStatus.BAD_REQUEST),
    FIELD_REQUIRED("ERR_4002", "Trường bắt buộc bị thiếu", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER("ERR_4003", "Tham số không hợp lệ", HttpStatus.BAD_REQUEST),
    VALUES_OUT_OF_RANGE("ERR_4004", "Giá trị nằm ngoài phạm vi cho phép", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("ERR_4005", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),

    // Authentication Errors (401x)
    UNAUTHORIZED("ERR_401", "Truy cập trái phép", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("ERR_4011", "Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("ERR_4012", "Token truy cập đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("ERR_4013", "Token truy cập không hợp lệ", HttpStatus.UNAUTHORIZED),
    UNABLE_TOKEN_CREATED("ERR_4014", "Không thể tạo token truy cập", HttpStatus.UNAUTHORIZED),

    // Authorization Errors (403x)
    FORBIDDEN("ERR_403", "Quyền truy cập bị cấm", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PRIVILEGES("ERR_4031", "Không đủ quyền để thực hiện hành động này", HttpStatus.FORBIDDEN),

    // Not Found Errors (404x)
    NOT_FOUND("ERR_404", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    RESOURCE_NOT_FOUND("ERR_4040", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("ERR_4041", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("ERR_4042", "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND("ERR_4043", "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),

    // Conflict Errors (409x)
    CONFLICT("ERR_409", "Xung đột tài nguyên", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("ERR_4091", "Địa chỉ email đã được đăng ký", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS("ERR_4092", "Số điện thoại đã được đăng ký", HttpStatus.CONFLICT),
    USERNAME_ALREADY_EXISTS("ERR_4093", "Tên đăng nhập đã được sử dụng", HttpStatus.CONFLICT),

    // Validation Errors (422x)
    UNPROCESSABLE_ENTITY("ERR_422", "Thực thể không thể xử lý", HttpStatus.UNPROCESSABLE_ENTITY),
    EMAIL_INVALID("ERR_4221", "Định dạng email không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    EMAIL_HAS_BEEN_USED("ERR_4222", "Email đã được sử dụng", HttpStatus.UNPROCESSABLE_ENTITY),
    PHONE_INVALID("ERR_4223", "Định dạng số điện thoại không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    PHONE_NUMBER_INVALID("ERR_4224", "Số điện thoại không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_NOT_STRONG("ERR_4225", "Mật khẩu chưa đủ mạnh", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_TOO_WEAK("ERR_4226", "Mật khẩu không đáp ứng yêu cầu bảo mật", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_INVALID("ERR_4227", "Mật khẩu không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSWORD_NOT_MATCH("ERR_4228", "Mật khẩu không khớp", HttpStatus.UNPROCESSABLE_ENTITY),
    DATE_INVALID("ERR_4229", "Định dạng ngày không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),

    // ========== PASSCODE/OTP ERRORS (Bổ sung từ danh sách cũ) ==========
    PASSCODE_NOT_MATCH("ERR_4231", "Mã xác thực không khớp", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_HAS_BEEN_USED("ERR_4232", "Mã xác thực đã được sử dụng", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_EXPIRED("ERR_4233", "Mã xác thực đã hết hạn", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_INVALID("ERR_4234", "Định dạng mã xác thực không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),
    PASSCODE_TOO_MANY_ATTEMPTS("ERR_4235", "Qua nhiều lần thử mã xác thực", HttpStatus.TOO_MANY_REQUESTS),

    // ========== ACCOUNT STATUS ERRORS (Bổ sung) ==========
    ACCOUNT_LOCKED("ERR_4236", "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    ACCOUNT_SUSPENDED("ERR_4237", "Tài khoản đã bị tạm ngưng", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_VERIFIED("ERR_4238", "Tài khoản chưa được xác thực", HttpStatus.FORBIDDEN),
    ACCOUNT_EXPIRED("ERR_4239", "Tài khoản đã hết hạn", HttpStatus.FORBIDDEN),

    // ========== FILE/UPLOAD ERRORS (Bổ sung) ==========
    FILE_TOO_LARGE("ERR_4241", "Kích thước tập tin vượt quá giới hạn", HttpStatus.PAYLOAD_TOO_LARGE),
    FILE_TYPE_NOT_SUPPORTED("ERR_4242", "Loại tập tin không được hỗ trợ", HttpStatus.UNPROCESSABLE_ENTITY),
    FILE_UPLOAD_FAILED("ERR_4243", "Tải lên tập tin thất bại", HttpStatus.BAD_REQUEST),
    IMAGE_INVALID("ERR_4244", "Định dạng hình ảnh không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),

    // ========== RATE LIMITING (Bổ sung) ==========
    TOO_MANY_REQUESTS("ERR_429", "Qua nhiều yêu cầu", HttpStatus.TOO_MANY_REQUESTS),

    // ========== SERVER ERROR CODES (5xx) ==========
    INTERNAL_SERVER_ERROR("ERR_500", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("ERR_503", "Dịch vụ tạm thời không khả dụng", HttpStatus.SERVICE_UNAVAILABLE),
    DATABASE_ERROR("ERR_5001", "Lỗi kết nối cơ sở dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR),
    EXTERNAL_SERVICE_ERROR("ERR_5002", "Lỗi dịch vụ bên ngoài", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_PROCESSING_ERROR("ERR_5003", "Lỗi xử lý tập tin", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_SERVICE_ERROR("ERR_5004", "Lỗi dịch vụ email", HttpStatus.INTERNAL_SERVER_ERROR),
    SMS_SERVICE_ERROR("ERR_5005", "Lỗi dịch vụ SMS", HttpStatus.INTERNAL_SERVER_ERROR),

    // ========== BUSINESS LOGIC ERRORS (6xx) ==========
    BUSINESS_LOGIC_ERROR("ERR_600", "Vi phạm logic kinh doanh", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK("ERR_6001", "Tồn kho sản phẩm không đủ", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED("ERR_6002", "Không thể hủy đơn hàng ở giai đoạn này", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED("ERR_6003", "Xử lý thanh toán thất bại", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS("ERR_6004", "Chuyển đổi trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),

    // ========== PRODUCT/INVENTORY ERRORS (Bổ sung cho hệ thống bán hàng)
    // ==========
    PRODUCT_OUT_OF_STOCK("ERR_6005", "Sản phẩm đã hết hàng", HttpStatus.BAD_REQUEST),
    PRODUCT_DISCONTINUED("ERR_6006", "Sản phẩm đã ngừng sản xuất", HttpStatus.BAD_REQUEST),
    INVALID_QUANTITY("ERR_6007", "Số lượng yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    PRICE_CHANGED("ERR_6008", "Giá sản phẩm đã thay đổi", HttpStatus.BAD_REQUEST),

    // ========== CART/CHECKOUT ERRORS (Bổ sung) ==========
    CART_EMPTY("ERR_6009", "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND("ERR_6010", "Không tìm thấy sản phẩm trong giỏ hàng", HttpStatus.NOT_FOUND),
    CHECKOUT_FAILED("ERR_6011", "Quá trình thanh toán thất bại", HttpStatus.BAD_REQUEST),

    // ========== SHIPPING/ADDRESS ERRORS (Bổ sung) ==========
    INVALID_ADDRESS("ERR_6012", "Địa chỉ giao hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    SHIPPING_NOT_AVAILABLE("ERR_6013", "Không có dịch vụ giao hàng đến địa điểm này", HttpStatus.BAD_REQUEST),

    // ========== PROMOTION/DISCOUNT ERRORS (Bổ sung) ==========
    COUPON_INVALID("ERR_6014", "Mã giảm giá không hợp lệ", HttpStatus.BAD_REQUEST),
    COUPON_EXPIRED("ERR_6015", "Mã giảm giá đã hết hạn", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_USED("ERR_6016", "Mã giảm giá đã được sử dụng", HttpStatus.BAD_REQUEST),
    DISCOUNT_NOT_APPLICABLE("ERR_6017", "Không thể áp dụng giảm giá", HttpStatus.BAD_REQUEST),

    // ========== TRADE-IN ERRORS (Bổ sung cho hệ thống thu cũ đổi mới) ==========
    TRADEIN_NOT_ELIGIBLE("ERR_6018", "Thiết bị không đủ điều kiện thu cũ đổi mới", HttpStatus.BAD_REQUEST),
    TRADEIN_QUOTE_EXPIRED("ERR_6019", "Báo giá thu cũ đổi mới đã hết hạn", HttpStatus.BAD_REQUEST),
    DEVICE_CONDITION_MISMATCH("ERR_6020", "Tình trạng thiết bị không khớp với mô tả", HttpStatus.BAD_REQUEST),

    // ========== OTP / VERIFICATION ERRORS ==========
    // OTP đã được gửi thành công tới người dùng (thường trả về sau thao tác gửi)
    OTP_SENT("ERR_4250", "Mã OTP đã được gửi thành công", HttpStatus.OK),

    // Lỗi khi nhà cung cấp (SMS/Email) trả về lỗi, không gửi được OTP
    OTP_DELIVERY_FAILED("ERR_4251", "Thất bại khi gửi OTP (lỗi nhà cung cấp)", HttpStatus.SERVICE_UNAVAILABLE),

    // Đã vượt quá số lần được phép gửi lại OTP trong giới hạn quy định trong này
    // (resend limit)
    OTP_RESEND_LIMIT_REACHED("ERR_4252", "Đã đạt giới hạn gửi lại OTP", HttpStatus.TOO_MANY_REQUESTS),

    // Yêu cầu gửi lại quá sớm — phải chờ cooldown giữa hai lần gửi (thường dùng khi
    // có resendCooldownSeconds)
    OTP_RESEND_COOLDOWN("ERR_4253", "Phải chờ trước khi yêu cầu OTP khác", HttpStatus.TOO_MANY_REQUESTS),

    // OTP có định dạng không hợp lệ (ví dụ: độ dài sai, chứa ký tự không cho phép)
    OTP_INVALID_FORMAT("ERR_4254", "Định dạng OTP không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),

    // OTP không hợp lệ chung (dùng cho trường hợp không khớp / không đúng theo
    // business rule)
    OTP_INVALID("ERR_4255", "Mã OTP không hợp lệ", HttpStatus.UNPROCESSABLE_ENTITY),

    // Mã OTP nhập vào không khớp (thường trả về khi verify thất bại)
    OTP_MISMATCH("ERR_4256", "Mã OTP không khớp", HttpStatus.UNPROCESSABLE_ENTITY),

    // Quá nhiều lần thử xác thực OTP (vượt ngưỡng maxAttempts) — áp dụng
    // throttle/lockout
    OTP_TOO_MANY_ATTEMPTS("ERR_4257", "Quá nhiều lần thử xác thực OTP", HttpStatus.TOO_MANY_REQUESTS),

    // OTP đã được sử dụng trước đó và không thể sử dụng lại (expireOnUse = true)
    OTP_ALREADY_USED("ERR_4258", "Mã OTP đã được sử dụng", HttpStatus.UNPROCESSABLE_ENTITY),

    // OTP đã hết hạn theo TTL/expiration — yêu cầu gửi lại mã mới
    OTP_EXPIRED("ERR_4259", "Mã OTP đã hết hạn", HttpStatus.UNPROCESSABLE_ENTITY);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}