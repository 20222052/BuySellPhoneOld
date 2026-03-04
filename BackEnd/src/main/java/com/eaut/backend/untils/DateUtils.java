package com.eaut.backend.untils;

import lombok.extern.slf4j.Slf4j;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

/**
 * Comprehensive date utility class for all date/time operations
 * Replaces Utils class with better date handling
 */
@Slf4j
public class DateUtils {

    // Common date patterns
    public static final String PATTERN_DDMMYYYY_HHMMSS = "ddMMyyyyHHmmss";
    public static final String PATTERN_YYYY_MM_DD = "yyyy-MM-dd";
    public static final String PATTERN_YYYY_MM_DD_HH_MM_SS = "yyyy-MM-dd HH:mm:ss";
    public static final String PATTERN_ISO_LOCAL_DATE_TIME = "yyyy-MM-dd'T'HH:mm:ss";

    public static final String PATTERN_YYYYMMDD_HHMM = "yyyyMMddHHmm";
    public static final String PATTERN_YYYYMMDD_HHMMSS = "yyyyMMddHHmmss";
    public static final String PATTERN_HH_MM_DD_MM_YYYY = "HH:mm dd/MM/yyyy";

    public static final String PATTERN_DD_MM_YYYY = "dd/MM/yyyy";
    public static final String PATTERN_YYYYMMDD = "yyyyMMdd";

    // Formatters
    private static final DateTimeFormatter DDMMYYYY_HHMMSS_FORMATTER = DateTimeFormatter
            .ofPattern(PATTERN_DDMMYYYY_HHMMSS);
    private static final DateTimeFormatter YYYY_MM_DD_FORMATTER = DateTimeFormatter.ofPattern(PATTERN_YYYY_MM_DD);
    private static final DateTimeFormatter YYYY_MM_DD_HH_MM_SS_FORMATTER = DateTimeFormatter
            .ofPattern(PATTERN_YYYY_MM_DD_HH_MM_SS);
    private static final DateTimeFormatter ISO_LOCAL_DATE_TIME_FORMATTER = DateTimeFormatter
            .ofPattern(PATTERN_ISO_LOCAL_DATE_TIME);

    /**
     * Get current date as string in ddMMyyyyHHmmss format
     */
    public static String currentDate() {
        return LocalDateTime.now().format(DDMMYYYY_HHMMSS_FORMATTER);
    }

    /**
     * Get current date as string with custom pattern
     */
    public static String currentDate(String pattern) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return LocalDateTime.now().format(formatter);
        } catch (Exception e) {
            log.error("M\u1eabu ng\u00e0y kh\u00f4ng h\u1ee3p l\u1ec7: {}", pattern, e);
            throw new IllegalArgumentException("Invalid date pattern: " + pattern);
        }
    }

    /**
     * Get current date as LocalDateTime
     */
    public static LocalDateTime now() {
        return LocalDateTime.now();
    }

    /**
     * Get current date as LocalDate
     */
    public static LocalDate today() {
        return LocalDate.now();
    }

    /**
     * Convert Date to string in ddMMyyyyHHmmss format
     */
    public static String parseDateToString(Date date) {
        if (date == null)
            return null;
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime()
                .format(DDMMYYYY_HHMMSS_FORMATTER);
    }

    /**
     * Convert Date to string with custom format
     */
    public static String parseDateToStringFormat(Date date, String format) {
        if (date == null)
            return null;
        try {
            DateFormat df = new SimpleDateFormat(format);
            return df.format(date);
        } catch (Exception e) {
            log.error("L\u1ed7i \u0111\u1ecbnh d\u1ea1ng ng\u00e0y v\u1edbi m\u1eabu: {}", format, e);
            throw new IllegalArgumentException("Invalid date format: " + format);
        }
    }

    /**
     * Convert LocalDateTime to string with custom format
     */
    public static String formatLocalDateTime(LocalDateTime dateTime, String pattern) {
        if (dateTime == null)
            return null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return dateTime.format(formatter);
        } catch (Exception e) {
            log.error("L\u1ed7i \u0111\u1ecbnh d\u1ea1ng LocalDateTime v\u1edbi m\u1eabu: {}", pattern, e);
            throw new IllegalArgumentException("Invalid date pattern: " + pattern);
        }
    }

    /**
     * Parse string to Date with custom format
     */
    public static Date parseStringToDateFormat(String date, String format) throws ParseException {
        if (date == null || date.trim().isEmpty())
            return null;
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(format);
            return sdf.parse(date);
        } catch (ParseException e) {
            log.error("L\u1ed7i ph\u00e2n t\u00edch chu\u1ed7i ng\u00e0y: {} v\u1edbi \u0111\u1ecbnh d\u1ea1ng: {}",
                    date, format, e);
            throw e;
        }
    }

    /**
     * Parse string to LocalDateTime with custom format
     */
    public static LocalDateTime parseStringToLocalDateTime(String date, String pattern) {
        if (date == null || date.trim().isEmpty())
            return null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return LocalDateTime.parse(date, formatter);
        } catch (DateTimeParseException e) {
            log.error("Error parsing date string: {} with pattern: {}", date, pattern, e);
            throw new IllegalArgumentException("Invalid date format: " + date);
        }
    }

    /**
     * Parse string to LocalDate with custom format
     */
    public static LocalDate parseStringToLocalDate(String date, String pattern) {
        if (date == null || date.trim().isEmpty())
            return null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            return LocalDate.parse(date, formatter);
        } catch (DateTimeParseException e) {
            log.error("Error parsing date string: {} with pattern: {}", date, pattern, e);
            throw new IllegalArgumentException("Invalid date format: " + date);
        }
    }

    /**
     * Convert Date to LocalDateTime
     */
    public static LocalDateTime dateToLocalDateTime(Date date) {
        if (date == null)
            return null;
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    /**
     * Convert LocalDateTime to Date
     */
    public static Date localDateTimeToDate(LocalDateTime dateTime) {
        if (dateTime == null)
            return null;
        return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    /**
     * Check if string is valid date with given pattern
     */
    public static boolean isValidDate(String date, String pattern) {
        if (date == null || date.trim().isEmpty())
            return false;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
            LocalDateTime.parse(date, formatter);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    /**
     * Get start of day for given date
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    /**
     * Get end of day for given date
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    /**
     * Get start of month for given date
     */
    public static LocalDate startOfMonth(LocalDate date) {
        return date.withDayOfMonth(1);
    }

    /**
     * Get end of month for given date
     */
    public static LocalDate endOfMonth(LocalDate date) {
        return date.withDayOfMonth(date.lengthOfMonth());
    }

    /**
     * Add days to date
     */
    public static LocalDate addDays(LocalDate date, long days) {
        return date.plusDays(days);
    }

    /**
     * Subtract days from date
     */
    public static LocalDate subtractDays(LocalDate date, long days) {
        return date.minusDays(days);
    }

    /**
     * Calculate days between two dates
     */
    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
    }

    /**
     * Calculate hours between two date times
     */
    public static long hoursBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return java.time.temporal.ChronoUnit.HOURS.between(startDateTime, endDateTime);
    }

    /**
     * Check if date is today
     */
    public static boolean isToday(LocalDate date) {
        return LocalDate.now().equals(date);
    }

    /**
     * Check if date is in the past
     */
    public static boolean isPast(LocalDate date) {
        return date.isBefore(LocalDate.now());
    }

    /**
     * Check if date is in the future
     */
    public static boolean isFuture(LocalDate date) {
        return date.isAfter(LocalDate.now());
    }

    /**
     * Parse chuỗi CDS "yyyyMMddHHmm" / "yyyyMMddHHmmss" về LocalDateTime
     */
    public static LocalDateTime parseCDSDateTime(String s) {
        if (s == null || s.isBlank())
            return null;
        String v = s.trim();

        // nếu có giây (14 ký tự) mà chỉ cần đến phút, cắt bớt để ổn định
        if (v.length() == 14 && v.matches("\\d{14}")) {
            v = v.substring(0, 12);
        }
        // v lúc này kỳ vọng 12 ký tự
        if (v.length() == 12 && v.matches("\\d{12}")) {
            return parseStringToLocalDateTime(v, PATTERN_YYYYMMDD_HHMM);
        }

        // fallback: thử “đủ giây”
        try {
            return parseStringToLocalDateTime(s, PATTERN_YYYYMMDD_HHMMSS);
        } catch (Exception ex) {
            log.warn("parseCDSDateTime th\u1ea5t b\u1ea1i cho '{}': {}", s, ex.getMessage());
            return null;
        }
    }

    /**
     * Parse theo srcPattern rồi format ra dstPattern. Lỗi -> trả null (an toàn cho
     * pipeline map).
     */
    public static String formatFromTo(String input, String srcPattern, String dstPattern) {
        try {
            LocalDateTime dt = parseStringToLocalDateTime(input, srcPattern);
            return formatLocalDateTime(dt, dstPattern);
        } catch (Exception e) {
            log.debug("formatFromTo fail: '{}' [{}]->[{}]: {}", input, srcPattern, dstPattern, e.getMessage());
            return null;
        }
    }

    /** Chuyên dụng cho “clinical minute” của CDS -> "HH:mm dd/MM/yyyy" */
    public static String formatClinicalMinute(String input) {
        try {
            LocalDateTime dt = parseCDSDateTime(input);
            return dt == null ? null : formatLocalDateTime(dt, PATTERN_HH_MM_DD_MM_YYYY);
        } catch (Exception e) {
            log.debug("formatClinicalMinute fail '{}': {}", input, e.getMessage());
            return null;
        }
    }

    public static LocalDate parseCDSDate(String s) {
        if (s == null || s.isBlank())
            return null;
        String v = s.trim();
        if (v.matches("\\d{8}")) {
            return parseStringToLocalDate(v, PATTERN_YYYYMMDD);
        }
        // fallback: nếu đã là dd/MM/yyyy thì trả về luôn
        try {
            return parseStringToLocalDate(v, PATTERN_DD_MM_YYYY);
        } catch (Exception ignore) {
            log.warn("parseCDSDate th\u1ea5t b\u1ea1i cho '{}'", s);
            return null;
        }
    }

    /**
     * Chuyển chuỗi ngày/giờ CDS ("yyyyMMddHHmm" hoặc "...ss") sang "dd/MM/yyyy".
     */
    public static String formatCDSTo_ddMMyyyy(String input) {
        if (input == null || input.isBlank())
            return null;

        // 1) Thử parse dạng có time trước
        LocalDateTime dt = parseCDSDateTime(input); // đã xử lý 12/14 ký tự
        if (dt != null) {
            return dt.toLocalDate().format(DateTimeFormatter.ofPattern(PATTERN_DD_MM_YYYY));
        }

        // 2) Thử parse dạng chỉ có date yyyyMMdd
        LocalDate d = parseCDSDate(input);
        if (d != null) {
            return d.format(DateTimeFormatter.ofPattern(PATTERN_DD_MM_YYYY));
        }

        // 3) Nếu vốn đã là dd/MM/yyyy thì trả về luôn (để idempotent)
        try {
            LocalDate d2 = parseStringToLocalDate(input, PATTERN_DD_MM_YYYY);
            return d2.format(DateTimeFormatter.ofPattern(PATTERN_DD_MM_YYYY));
        } catch (Exception ignore) {
        }

        log.debug("formatCDSTo_ddMMyyyy: cannot format '{}'", input);
        return null;
    }

    // public static String formatCDSTo_ddMMyyyy(String input) {
    // try {
    // var dt = parseCDSDateTime(input);
    // return dt == null ? null
    // : dt.toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    // } catch (Exception e) {
    // log.debug("formatCDSTo_ddMMyyyy fail '{}': {}", input, e.getMessage());
    // return null;
    // }
    // }
}