package com.example.QuanLyDanCu.enums;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Centralized list of allowed change-log types.
 */
public enum BienDongType {
    CHUYEN_DEN,
    CHUYEN_DI,
    TACH_HO,
    NHAP_HO,
    SINH,
    KHAI_TU,
    THAY_DOI_THONG_TIN,
    TAM_TRU,
    HUY_TAM_TRU,
    TAM_VANG,
    HUY_TAM_VANG;

    public static BienDongType fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Loại biến động không được để trống");
        }
        try {
            return BienDongType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Loại biến động phải thuộc: " + allowedValues());
        }
    }

    public static String allowedValues() {
        return Arrays.stream(values()).map(Enum::name).collect(Collectors.joining(", "));
    }
}
