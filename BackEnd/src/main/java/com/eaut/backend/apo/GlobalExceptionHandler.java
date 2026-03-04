package com.eaut.backend.apo;

import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.model.response.BadRequestResponse;
import com.eaut.backend.constant.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    /**
     * Xử lý lỗi khi gọi sai phương thức HTTP (405 Method Not Allowed)
     */
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<BadRequestResponse> handleMethodNotSupported(
            org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        log.warn("Method not allowed: {}", ex.getMessage());
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Phương thức HTTP không được hỗ trợ cho URL này.",
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    /**
     * Xử lý lỗi khi gửi lên media type không hỗ trợ (415 Unsupported Media Type)
     */
    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<BadRequestResponse> handleMediaTypeNotSupported(
            org.springframework.web.HttpMediaTypeNotSupportedException ex) {
        log.warn("Media type not supported: {}", ex.getMessage());
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Định dạng dữ liệu gửi lên không được hỗ trợ.",
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    /**
     * Xử lý lỗi khi client yêu cầu media type không được hỗ trợ (406 Not
     * Acceptable)
     */
    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<BadRequestResponse> handleMediaTypeNotAcceptable(
            org.springframework.web.HttpMediaTypeNotAcceptableException ex) {
        log.warn("Media type not acceptable: {}", ex.getMessage());
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Định dạng dữ liệu phản hồi không phù hợp với yêu cầu của client.",
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(response);
    }

    /**
     * Xử lý lỗi binding dữ liệu (400 Bad Request)
     */
    @ExceptionHandler(org.springframework.validation.BindException.class)
    public ResponseEntity<BadRequestResponse> handleBindException(org.springframework.validation.BindException ex) {
        log.warn("BindException: {}", ex.getMessage());
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Lỗi dữ liệu gửi lên không hợp lệ");
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý lỗi kiểu dữ liệu không khớp (400 Bad Request)
     */
    @ExceptionHandler(org.springframework.beans.TypeMismatchException.class)
    public ResponseEntity<BadRequestResponse> handleTypeMismatch(org.springframework.beans.TypeMismatchException ex) {
        log.warn("TypeMismatchException: {}", ex.getMessage());
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Kiểu dữ liệu truyền vào không hợp lệ.",
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý lỗi Servlet chung (500 Internal Server Error)
     */
    @ExceptionHandler(jakarta.servlet.ServletException.class)
    public ResponseEntity<BadRequestResponse> handleServletException(jakarta.servlet.ServletException ex) {
        log.error("ServletException: {}", ex.getMessage(), ex);
        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi hệ thống khi xử lý request.",
                httpServletRequest);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    protected final HttpServletRequest httpServletRequest;

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<BadRequestResponse> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.NOT_FOUND,
                "Không tồn tại URL này: " + httpServletRequest.getRequestURI(),
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Xử lý AccessDeniedException (403 Forbidden)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BadRequestResponse> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.FORBIDDEN,
                "Không có quyền truy cập vào tài nguyên này. Vui lòng kiểm tra lại quyền của bạn.",
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Xử lý AuthenticationException (401 Unauthorized)
     */
    @ExceptionHandler({ AuthenticationException.class, InsufficientAuthenticationException.class })
    public ResponseEntity<BadRequestResponse> handleAuthenticationException(Exception ex) {
        log.warn("Authentication failed: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.UNAUTHORIZED,
                "Không thể xác thực yêu cầu. Vui lòng cung cấp token hợp lệ hoặc đăng nhập lại.",
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<BadRequestResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {

        log.warn("Invalid request body: {}", ex.getMessage());

        String message = "Dữ liệu gửi lên không hợp lệ";

        Throwable root = ex.getMostSpecificCause();
        if (root != null && root.getMessage() != null) {
            message = root.getMessage();
        }

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý ApplicationException (Business Logic Errors)
     */
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<BadRequestResponse> handleApplicationException(ApplicationException ex) {
        log.error("HandleApplicationException {} with message {}, title {}, data {}",
                ex.getCode(), ex.getMessage(), ex.getTitle(), ex.getData());

        BadRequestResponse response = new BadRequestResponse(ex, httpServletRequest);

        // Lấy HTTP status từ ErrorCode nếu có
        HttpStatus httpStatus = HttpStatus.BAD_REQUEST; // default
        try {
            // Tìm ErrorCode tương ứng để lấy HTTP status
            for (ErrorCode errorCode : ErrorCode.values()) {
                if (errorCode.getCode().equals(ex.getCode())) {
                    httpStatus = errorCode.getHttpStatus();
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("Could not determine HTTP status for error code: {}", ex.getCode());
        }

        return ResponseEntity.status(httpStatus).body(response);
    }

    // xử lý MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BadRequestResponse> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Lỗi xác thực dữ liệu");

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // xử lý MissingServletRequestParameterException
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<BadRequestResponse> handleMissingRequestParam(
            MissingServletRequestParameterException ex) {

        log.warn("Missing request parameter: {}", ex.getParameterName());

        String message = String.format(
                "Thiếu tham số bắt buộc: '%s'",
                ex.getParameterName());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<BadRequestResponse> handleMultipartException(
            MultipartException ex) {

        log.warn("Multipart request error: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Yêu cầu không đúng định dạng: multipart/form-data",
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BadRequestResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                ex.getMessage(),
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý NullPointerException
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<BadRequestResponse> handleNullPointerException(NullPointerException ex) {
        log.error("Null pointer exception: {}", ex.getMessage(), ex);

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ bộ phận hỗ trợ nếu lỗi tiếp tục xuất hiện.",
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<BadRequestResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        log.warn("Data integrity violation", ex);

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Dữ liệu vi phạm ràng buộc: " + ex.getMostSpecificCause().getMessage()
                        + ". Vui lòng kiểm tra dữ liệu không vi phạm các ràng buộc hệ thống.",
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Xử lý với các lỗi thông thường (500 Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BadRequestResponse> handleException(Exception e) {
        log.error("An error occurred: {}", e.getMessage(), e);

        // Tạo error details để debug
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("exceptionType", e.getClass().getSimpleName());
        errorDetails.put("cause", e.getCause() != null ? e.getCause().getMessage() : null);

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
                errorDetails,
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Xử lý RuntimeException khác
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<BadRequestResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("exceptionType", ex.getClass().getSimpleName());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi hệ thống khi thực thi. Vui lòng thử lại sau.",
                errorDetails,
                httpServletRequest);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
