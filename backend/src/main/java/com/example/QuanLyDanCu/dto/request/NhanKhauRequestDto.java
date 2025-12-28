package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO để tạo/cập nhật nhân khẩu")
public class NhanKhauRequestDto {

    @Schema(description = "Họ và tên", example = "Nguyễn Văn A")
    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @Schema(description = "Ngày sinh (yyyy-MM-dd)", example = "1990-05-15")
    @NotNull(message = "Ngày sinh không được để trống")
    @PastOrPresent(message = "Ngày sinh không được là ngày trong tương lai")
    private LocalDate ngaySinh;

    @Schema(description = "Giới tính", example = "Nam", allowableValues = {"Nam", "Nữ", "Khác"})
    @NotBlank(message = "Giới tính không được để trống")
    private String gioiTinh;

    @Schema(description = "Dân tộc", example = "Kinh")
    @NotNull(message = "Dân tộc không được để trống")
    private String danToc;

    @Schema(description = "Quốc tịch", example = "Việt Nam")
    @NotNull(message = "Quốc tịch không được để trống")
    private String quocTich;

    @Schema(description = "Quê Quán", example = "Bách khoa, Bạch Mai, Hà Nội")
    @NotNull(message = "Quê quán không được để trống")
    private String queQuan;

    @Schema(description = "Nghề nghiệp", example = "Kỹ sư")
    private String ngheNghiep;

    @Schema(description = "Số CMND/CCCD (12 chữ số)", example = "001234567890")
    @Pattern(regexp = "^\\d{12}$", message = "Căn cước công dân phải gồm 12 số")
    private String cmndCccd;

    @Schema(description = "Ngày cấp CMND/CCCD", example = "2020-01-15")
    private LocalDate ngayCap;

    @Schema(description = "Nơi cấp", example = "Công an TP. Hà Nội")
    private String noiCap;

    @Schema(description = "Quan hệ với chủ hộ", example = "Chủ hộ", allowableValues = {"Chủ hộ", "Vợ/Chồng", "Con", "Bố/Mẹ", "Khác"})
    private String quanHeChuHo;

    @Schema(description = "Ghi chú", example = "Người thân cần chăm sóc đặc biệt")
    private String ghiChu;

    @Schema(description = "ID hộ khẩu mà nhân khẩu thuộc về", example = "1")
    @NotNull(message = "ID hộ khẩu không được để trống")
    private Long hoKhauId;
}
