package com.example.QuanLyDanCu.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO cho thông tin nhân khẩu")
public class NhanKhauResponseDto {

    @Schema(description = "ID nhân khẩu", example = "1")
    private Long id;

    @Schema(description = "Họ và tên", example = "Nguyễn Văn A")
    private String hoTen;

    @Schema(description = "Ngày sinh", example = "1990-05-15")
    private LocalDate ngaySinh;

    @Schema(description = "Giới tính", example = "Nam")
    private String gioiTinh;

    @Schema(description = "Dân tộc", example = "Kinh")
    private String danToc;

    @Schema(description = "Quốc tịch", example = "Việt Nam")
    private String quocTich;

    @Schema(description = "Nghề nghiệp", example = "Kỹ sư")
    private String ngheNghiep;

    @Schema(description = "Số CMND/CCCD", example = "001234567890")
    private String cmndCccd;

    @Schema(description = "Ngày cấp CMND/CCCD", example = "2020-01-15")
    private LocalDate ngayCap;

    @Schema(description = "Nơi cấp", example = "Công an TP. Hà Nội")
    private String noiCap;

    @Schema(description = "Quan hệ với chủ hộ", example = "Chủ hộ")
    private String quanHeChuHo;

    @Schema(description = "Ghi chú", example = "Người thân cần chăm sóc đặc biệt")
    private String ghiChu;

    @Schema(description = "Ngày bắt đầu tạm vắng", example = "2024-01-10")
    private LocalDate tamVangTu;

    @Schema(description = "Ngày kết thúc tạm vắng", example = "2024-01-20")
    private LocalDate tamVangDen;

    @Schema(description = "Ngày bắt đầu tạm trú", example = "2024-02-01")
    private LocalDate tamTruTu;

    @Schema(description = "Ngày kết thúc tạm trú", example = "2024-02-15")
    private LocalDate tamTruDen;

    @Schema(description = "ID hộ khẩu", example = "1")
    private Long hoKhauId;

    @Schema(description = "ID người tạo", example = "1")
    private Long createdBy;

    @Schema(description = "ID người cập nhật", example = "2")
    private Long updatedBy;

    @Schema(description = "Thời gian tạo", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật", example = "2024-01-15T14:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Trạng thái hiện tại (computed)", example = "THUONG_TRU", allowableValues = {"THUONG_TRU", "TAM_VANG", "TAM_TRU"})
    private String trangThaiHienTai;
}
