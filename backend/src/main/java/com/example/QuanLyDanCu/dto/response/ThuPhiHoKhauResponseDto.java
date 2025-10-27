package com.example.QuanLyDanCu.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Response DTO for ThuPhiHoKhau entity")
public class ThuPhiHoKhauResponseDto {

    @Schema(description = "ID thu phí", example = "1")
    private Long id;

    @Schema(description = "ID hộ khẩu", example = "1")
    private Long hoKhauId;

    @Schema(description = "Số hộ khẩu", example = "HK001")
    private String soHoKhau;

    @Schema(description = "Tên chủ hộ", example = "Nguyễn Văn A")
    private String tenChuHo;

    @Schema(description = "ID đợt thu phí", example = "1")
    private Long dotThuPhiId;

    @Schema(description = "Tên đợt thu", example = "Thu phí tháng 1/2025")
    private String tenDot;

    @Schema(description = "Số tiền đã thu (VND)", example = "50000")
    private BigDecimal soTienDaThu;

    @Schema(description = "Ngày thu")
    private LocalDate ngayThu;

    @Schema(description = "Các tháng thu", example = "1,2,3")
    private String months;

    @Schema(description = "Ghi chú", example = "Đã thanh toán đủ")
    private String ghiChu;

    @Schema(description = "ID người thu")
    private Long collectedBy;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
}
