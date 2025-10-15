package com.eaut.backend.untils;

import com.eaut.backend.Exception.ApplicationException;
import org.apache.commons.lang3.StringUtils;

public class PhoneNumberUtils {
    public static String validatePhoneNumber(String phoneNumber) {
        if (StringUtils.isBlank(phoneNumber)) {
            throw new ApplicationException(ErrorCode.PHONE_INVALID, "PhoneNumber is invalid");
        }
        //check length phone number
        //+84976956191
        //0976956191
        //84976956191
//        có thể dùng trim hoặc repalaceAll để loại bỏ khoảng trắng
//        phoneNumber = phoneNumber.trim();
        phoneNumber = phoneNumber.replaceAll(" ","");
        if (phoneNumber.length() < 10 || phoneNumber.length() > 13) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "PhoneNumber is invalid");
        }
        if(!phoneNumber.startsWith("0") && !phoneNumber.startsWith("+84") && !phoneNumber.startsWith("84")) {
            throw new ApplicationException(ErrorCode.INVALID_PARAMETER, "PhoneNumber is invalid");
        }
        if (phoneNumber.startsWith("0")){
            return "84" + phoneNumber.substring(1);
        }
        if (phoneNumber.startsWith("+84")){
            return phoneNumber.substring(1);
        }
        if (phoneNumber.startsWith("84")){
            return phoneNumber;
        }
        return phoneNumber;
    }

}
