package com.example.QuanLyDanCu.dto.response;

import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
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

    @Schema(description = "Tên đợt thu", example = "Phí vệ sinh tháng 1/2025")
    private String tenDot;

    @Schema(description = "Số người trong hộ", example = "3")
    private Integer soNguoi;

    @Schema(description = "Tổng phí phải nộp (VND)", example = "216000")
    private BigDecimal tongPhi;

    @Schema(description = "Số tiền đã thu (VND)", example = "216000")
    private BigDecimal soTienDaThu;

    @Schema(description = "Trạng thái", example = "DA_NOP")
    private TrangThaiThuPhi trangThai;

    @Schema(description = "Mô tả kỳ thu", example = "Cả năm 2025")
    private String periodDescription;

    @Schema(description = "Ngày thu", example = "2025-01-15")
    private LocalDate ngayThu;

    @Schema(description = "Ghi chú", example = "Đã thanh toán đủ")
    private String ghiChu;

    @Schema(description = "ID người thu")
    private Long collectedBy;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
}
