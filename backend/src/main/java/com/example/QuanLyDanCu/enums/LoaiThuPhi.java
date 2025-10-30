package com.example.QuanLyDanCu.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại phí thu: BAT_BUOC (bắt buộc) hoặc TU_NGUYEN (tự nguyện)")
public enum LoaiThuPhi {
    @Schema(description = "Phí bắt buộc (vệ sinh, quản lý, bảo vệ, ...)")
    BAT_BUOC,
    
    @Schema(description = "Phí tự nguyện (đóng góp, từ thiện, ...)")
    TU_NGUYEN;
    
    /**
     * Validate if a string is a valid LoaiThuPhi value
     */
    public static boolean isValid(String value) {
        if (value == null) {
            return false;
        }
        try {
            LoaiThuPhi.valueOf(value.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Get Vietnamese description
     */
    public String getVietnameseDescription() {
        switch (this) {
            case BAT_BUOC:
                return "Bắt buộc";
            case TU_NGUYEN:
                return "Tự nguyện";
            default:
                return this.name();
        }
    }
}
