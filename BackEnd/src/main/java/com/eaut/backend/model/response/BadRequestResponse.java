package com.eaut.backend.model.response;

import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.constant.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class BadRequestResponse {
    private String title;
    private String errorCode;
    private String message;
    private Map<String, Object> data;
    private String uri;
    private LocalDateTime time;
    private String requestId;

    public BadRequestResponse(ApplicationException ex, HttpServletRequest httpServletRequest) {
        this.title = ex.getTitle();
        this.errorCode = ex.getCode();
        this.message = ex.getMessage();
        this.data = ex.getData();
        this.uri = httpServletRequest.getRequestURI();
        this.time = LocalDateTime.now();
        this.requestId = UUID.randomUUID().toString();
    }

    // Constructor mới cho ErrorCode
    public BadRequestResponse(ErrorCode errorCode, HttpServletRequest httpServletRequest) {
        this.title = "Error";
        this.errorCode = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.data = null;
        this.uri = httpServletRequest.getRequestURI();
        this.time = LocalDateTime.now();
        this.requestId = UUID.randomUUID().toString();
    }

    // Constructor mới cho ErrorCode với custom message
    public BadRequestResponse(ErrorCode errorCode, String customMessage, HttpServletRequest httpServletRequest) {
        this.title = "Error";
        this.errorCode = errorCode.getCode();
        this.message = customMessage;
        this.data = null;
        this.uri = httpServletRequest.getRequestURI();
        this.time = LocalDateTime.now();
        this.requestId = UUID.randomUUID().toString();
    }

    // Constructor mới cho ErrorCode với custom message và data
    public BadRequestResponse(ErrorCode errorCode, String customMessage, Map<String, Object> data, HttpServletRequest httpServletRequest) {
        this.title = "Error";
        this.errorCode = errorCode.getCode();
        this.message = customMessage;
        this.data = data;
        this.uri = httpServletRequest.getRequestURI();
        this.time = LocalDateTime.now();
        this.requestId = UUID.randomUUID().toString();
    }

    public BadRequestResponse() {
    }

    public BadRequestResponse(String title, String errorCode, String message, Map<String, Object> data, String uri, LocalDateTime time, String requestId) {
        this.title = title;
        this.errorCode = errorCode;
        this.message = message;
        this.data = data;
        this.uri = uri;
        this.time = time;
        this.requestId = requestId;
    }

    public BadRequestResponse(UUID uuid, int value, String message, String format) {
    }
}
