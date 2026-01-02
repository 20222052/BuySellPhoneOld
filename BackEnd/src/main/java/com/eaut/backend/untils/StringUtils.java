package com.eaut.backend.untils;

import com.eaut.backend.exception.ApplicationException;
import com.eaut.backend.constant.ErrorCode;

public class StringUtils {
    public static void validatePassword(String password) throws ApplicationException {

        if (org.apache.commons.lang3.StringUtils.isEmpty(password) || password.length() < 8) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER , "password is invalid");
        }

        if (!password.matches(".*[a-zA-Z].*")) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER , "password must contain at least one letter");
        }
    }
}
