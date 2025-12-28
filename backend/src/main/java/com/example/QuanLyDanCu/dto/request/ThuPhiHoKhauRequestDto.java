package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Request DTO for ThuPhiHoKhau entity - payment confirmation")
public class ThuPhiHoKhauRequestDto {

    @NotNull(message = "ID hộ khẩu không được để trống")
    @Positive(message = "ID hộ khẩu phải là số dương")
    @Schema(description = "ID của hộ khẩu", example = "1")
    private Long hoKhauId;

    @NotNull(message = "ID đợt thu phí không được để trống")
    @Positive(message = "ID đợt thu phí phải là số dương")
    @Schema(description = "ID của đợt thu phí", example = "1")
    private Long dotThuPhiId;

    @NotNull(message = "Vui lòng nhập ngày thu!")
    @Schema(description = "Ngày thu phí", example = "2025-01-15")
    private LocalDate ngayThu;

    @Schema(description = "Ghi chú", example = "Đã thanh toán đủ")
    private String ghiChu;

    @Schema(description = "Tổng số tiền hộ khẩu tự nguyện đóng góp (chỉ bắt buộc nếu đợt thu là tự nguyện)", example = "500000")
    @Digits(integer = 15, fraction = 2, message = "Tổng phí tự nguyện không đúng định dạng")
    @DecimalMin(value = "0.01", message = "Tổng phí tự nguyện phải lớn hơn 0")
    private BigDecimal tongPhi;
}
