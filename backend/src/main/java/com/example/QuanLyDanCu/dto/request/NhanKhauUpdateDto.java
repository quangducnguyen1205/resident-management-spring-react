package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for partial updates of NhanKhau entity.
 * All fields are nullable - only provided fields will be updated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update DTO để cập nhật nhân khẩu (chỉ các trường được cung cấp)")
public class NhanKhauUpdateDto {

    @Schema(description = "Họ và tên", example = "Nguyễn Văn A")
    private String hoTen;

    @Schema(description = "Ngày sinh (yyyy-MM-dd)", example = "1990-05-15")
    private LocalDate ngaySinh;

    @Schema(description = "Giới tính", example = "Nam", allowableValues = { "Nam", "Nữ", "Khác" })
    private String gioiTinh;

    @Schema(description = "Dân tộc", example = "Kinh")
    private String danToc;

    @Schema(description = "Quốc tịch", example = "Việt Nam")
    private String quocTich;

    @Schema(description = "Quê Quán", example = "Bách khoa, Bạch Mai, Hà Nội")
    private String queQuan;

    @Schema(description = "Nghề nghiệp", example = "Kỹ sư")
    private String ngheNghiep;

    @Schema(description = "Số CMND/CCCD", example = "001234567890")
    private String cmndCccd;

    @Schema(description = "Ngày cấp CMND/CCCD", example = "2020-01-15")
    private LocalDate ngayCap;

    @Schema(description = "Nơi cấp", example = "Công an TP. Hà Nội")
    private String noiCap;

    @Schema(description = "Quan hệ với chủ hộ", example = "Con")
    private String quanHeChuHo;

    @Schema(description = "Ghi chú", example = "Đã chuyển đi")
    private String ghiChu;

    @Schema(description = "ID hộ khẩu", example = "1")
    private Long hoKhauId;

    @Schema(description = "ID chủ hộ mới (bắt buộc nếu thay đổi chủ hộ hiện tại)", example = "10")
    private Long newChuHoId;

    @Schema(description = "Trạng thái", example = "Thường trú")
    private String trangThai;
}
