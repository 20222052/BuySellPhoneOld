package com.eaut.backend.untils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class BcryptUtils {
    public static PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(8);

    public static String encode(String password) {
        return passwordEncoder.encode(password);
    }

    public static boolean matches(String password, String encodedPassword) {
        return passwordEncoder.matches(password, encodedPassword);
    }

    public static void main(String[] args) {
        System.out.println(encode("123456"));
    }
}
