package com.eaut.backend.Exception;

import com.eaut.backend.untils.ErrorCode;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Data
public class ApplicationException extends RuntimeException {
    private final String code;
    private Map<String, Object> data;
    private String title;
    private String HTTPStatus;

    public ApplicationException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.title = errorCode.getMessage();
        this.HTTPStatus = errorCode.getHttpStatus().toString();
    }

    public ApplicationException(ErrorCode errorCode, String message) {
        super(message);
        this.code = errorCode.getCode();
        this.title = message;
        this.HTTPStatus = errorCode.getHttpStatus().toString();
    }

}
