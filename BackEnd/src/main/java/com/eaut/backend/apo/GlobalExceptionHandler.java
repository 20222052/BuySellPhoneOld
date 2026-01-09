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
    protected final HttpServletRequest httpServletRequest;


    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<BadRequestResponse> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
            ErrorCode.NOT_FOUND,
            "The requested resource was not found: " + httpServletRequest.getRequestURI(),
            httpServletRequest
        );

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
            "Access denied. You don't have permission to access this resource.", 
            httpServletRequest
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Xử lý AuthenticationException (401 Unauthorized)
     */
    @ExceptionHandler({AuthenticationException.class, InsufficientAuthenticationException.class})
    public ResponseEntity<BadRequestResponse> handleAuthenticationException(Exception ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        
        BadRequestResponse response = new BadRequestResponse(
            ErrorCode.UNAUTHORIZED, 
            "Authentication required. Please provide valid credentials.", 
            httpServletRequest
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }


    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<BadRequestResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {

        log.warn("Invalid request body: {}", ex.getMessage());

        String message = "Request body Invalid";

        Throwable root = ex.getMostSpecificCause();
        if (root != null && root.getMessage() != null) {
            message = root.getMessage();
        }

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest
        );

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

//  xử lý MethodArgumentNotValidException
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BadRequestResponse> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Validation error");

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

//  xử lý MissingServletRequestParameterException
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<BadRequestResponse> handleMissingRequestParam(
            MissingServletRequestParameterException ex) {

        log.warn("Missing request parameter: {}", ex.getParameterName());

        String message = String.format(
                "missing required parameters: '%s'",
                ex.getParameterName()
        );

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                message,
                httpServletRequest
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<BadRequestResponse> handleMultipartException(
            MultipartException ex) {

        log.warn("Multipart request error: {}", ex.getMessage());

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "The request is not in the correct format: multipart/form-data",
                httpServletRequest
        );

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
            httpServletRequest
        );
        
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
            "A system error occurred. Please contact support if this persists.",
            httpServletRequest
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<BadRequestResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        log.warn("Data integrity violation", ex);

        BadRequestResponse response = new BadRequestResponse(
                ErrorCode.INVALID_PARAMETER,
                "Data integrity violation: " + ex.getMostSpecificCause().getMessage() + ". Please ensure that your data does not violate any constraints.",
                httpServletRequest
        );

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
                "An unexpected error occurred. Please try again later.",
                errorDetails,
                httpServletRequest
        );

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
            "A runtime error occurred. Please try again later.",
            errorDetails,
            httpServletRequest
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
