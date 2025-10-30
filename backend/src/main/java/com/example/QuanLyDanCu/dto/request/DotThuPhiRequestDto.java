package com.example.QuanLyDanCu.dto.request;

import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Request DTO for DotThuPhi entity")
public class DotThuPhiRequestDto {

    @NotBlank(message = "Tên đợt thu không được để trống")
    @Schema(description = "Tên đợt thu phí", example = "Thu phí quản lý tháng 1/2025")
    private String tenDot;

    @NotNull(message = "Loại phí không được để trống")
    @Schema(description = "Loại phí: BAT_BUOC (bắt buộc) hoặc TU_NGUYEN (tự nguyện)", example = "BAT_BUOC", allowableValues = {"BAT_BUOC", "TU_NGUYEN"})
    private LoaiThuPhi loai;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Schema(description = "Ngày bắt đầu thu", example = "2025-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Schema(description = "Ngày kết thúc thu", example = "2025-01-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngayKetThuc;

    @NotNull(message = "Định mức không được để trống")
    @Positive(message = "Định mức phải là số dương")
    @Schema(description = "Định mức phí (VND)", example = "50000")
    private BigDecimal dinhMuc;
}
