package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Request DTO for ThuPhiHoKhau entity")
public class ThuPhiHoKhauRequestDto {

    @NotNull(message = "ID hộ khẩu không được để trống")
    @Positive(message = "ID hộ khẩu phải là số dương")
    @Schema(description = "ID của hộ khẩu", example = "1")
    private Long hoKhauId;

    @NotNull(message = "ID đợt thu phí không được để trống")
    @Positive(message = "ID đợt thu phí phải là số dương")
    @Schema(description = "ID của đợt thu phí", example = "1")
    private Long dotThuPhiId;

    @NotNull(message = "Số tiền đã thu không được để trống")
    @PositiveOrZero(message = "Số tiền đã thu phải lớn hơn hoặc bằng 0")
    @Schema(description = "Số tiền đã thu (VND)", example = "216000")
    private BigDecimal soTienDaThu;

    @Schema(description = "Ngày thu phí", example = "2025-01-15")
    private LocalDate ngayThu;

    @Schema(description = "Ghi chú", example = "Đã thanh toán đủ")
    private String ghiChu;
}
