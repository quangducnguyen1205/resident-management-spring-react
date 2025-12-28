package com.example.QuanLyDanCu.dto.response;

import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for DotThuPhi entity")
public class DotThuPhiResponseDto {

    @Schema(description = "ID đợt thu phí", example = "1")
    private Long id;

    @Schema(description = "Tên đợt thu", example = "Thu phí quản lý tháng 1/2025")
    private String tenDot;

    @Schema(description = "Loại phí: BAT_BUOC hoặc TU_NGUYEN", example = "BAT_BUOC")
    private LoaiThuPhi loai;

    @Schema(description = "Ngày bắt đầu")
    private LocalDate ngayBatDau;

    @Schema(description = "Ngày kết thúc")
    private LocalDate ngayKetThuc;

    @Schema(description = "Định mức (VND)", example = "50000")
    private BigDecimal dinhMuc;

    @Schema(description = "True: Thu theo đợt. False: Thu theo tháng")
    private Boolean thuTheoDot;

}
