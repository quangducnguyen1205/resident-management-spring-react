package com.example.QuanLyDanCu.dto.request;

import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for partial updates of DotThuPhi entity.
 * All fields are nullable - only provided fields will be updated.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Update DTO for DotThuPhi entity (chỉ các trường được cung cấp)")
public class DotThuPhiUpdateDto {

    @Schema(description = "Tên đợt thu phí", example = "Thu phí quản lý tháng 1/2025")
    private String tenDot;

    @Schema(description = "Loại phí: BAT_BUOC (bắt buộc) hoặc TU_NGUYEN (tự nguyện)", example = "BAT_BUOC", allowableValues = {"BAT_BUOC", "TU_NGUYEN"})
    private LoaiThuPhi loai;

    @Schema(description = "Ngày bắt đầu thu", example = "2025-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayBatDau;

    @Schema(description = "Ngày kết thúc thu", example = "2025-01-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayKetThuc;

    @Schema(description = "Định mức phí (VND). BAT_BUOC: phải > 0, TU_NGUYEN: mặc định 0", example = "50000")
    private BigDecimal dinhMuc;
}
