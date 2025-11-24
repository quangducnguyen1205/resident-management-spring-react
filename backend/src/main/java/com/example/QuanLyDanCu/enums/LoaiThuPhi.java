package com.example.QuanLyDanCu.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại phí thu: BAT_BUOC (bắt buộc) hoặc TU_NGUYEN (tự nguyện)")
public enum LoaiThuPhi {

    @Schema(description = "Phí bắt buộc (vệ sinh, quản lý, bảo vệ, ...)")
    BAT_BUOC,

    @Schema(description = "Phí tự nguyện (đóng góp, từ thiện, ...)")
    TU_NGUYEN;

    /**
     * Parse enum từ frontend chỉ với 2 giá trị:
     *  - BAT_BUOC
     *  - TU_NGUYEN
     */
    @JsonCreator
    public static LoaiThuPhi fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Loại thu phí không được để trống");
        }

        String normalized = value.trim().toUpperCase();

        switch (normalized) {
            case "BAT_BUOC":
                return BAT_BUOC;

            case "TU_NGUYEN":
                return TU_NGUYEN;

            default:
                throw new IllegalArgumentException(
                    "Loại thu phí không hợp lệ: " + value +
                    ". Chỉ chấp nhận: BAT_BUOC hoặc TU_NGUYEN"
                );
        }
    }

    /**
     * Trả về mô tả tiếng Việt chuẩn.
     */
    public String getVietnameseDescription() {
        return this == BAT_BUOC ? "Bắt buộc" : "Tự nguyện";
    }
}