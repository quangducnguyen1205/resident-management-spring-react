package com.example.QuanLyDanCu.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại phí thu: BAT_BUOC (bắt buộc) hoặc TU_NGUYEN (tự nguyện)")
public enum LoaiThuPhi {

    @Schema(description = "Phí bắt buộc (vệ sinh, quản lý, bảo vệ, ...)")
    BAT_BUOC,

    @Schema(description = "Phí tự nguyện (đóng góp, từ thiện, ...)")
    TU_NGUYEN;
}