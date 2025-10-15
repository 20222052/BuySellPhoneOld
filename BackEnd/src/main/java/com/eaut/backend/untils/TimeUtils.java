package com.eaut.backend.untils;

import java.time.Duration;
import java.time.LocalDateTime;

public class TimeUtils {

    public static long getTimeToLiveEndOfDay(){
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime midnight = now.toLocalDate().plusDays(1).atStartOfDay();

        return Duration.between(now, midnight).getSeconds();
    }


    public static void main(String[] args) {

    }
}
