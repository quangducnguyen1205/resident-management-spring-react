package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request DTO cho bảng bien_dong (ghi log thuần văn bản)")
public class BienDongRequestDto {

    private static final String ALLOWED_TYPES_REGEX = "^(?i)(CHUYEN_DEN|CHUYEN_DI|TACH_HO|NHAP_HO|KHAI_TU|SINH|THAY_DOI_THONG_TIN)$";

    @NotBlank(message = "Loại biến động không được để trống")
    @Pattern(regexp = ALLOWED_TYPES_REGEX, message = "Loại biến động phải thuộc: CHUYEN_DEN, CHUYEN_DI, TACH_HO, NHAP_HO, KHAI_TU, SINH, THAY_DOI_THONG_TIN")
    @Schema(description = "Loại biến động hợp lệ", example = "NHAP_HO", required = true)
    private String loai;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 1000, message = "Nội dung không được vượt quá 1000 ký tự")
    @Schema(description = "Nội dung mô tả chi tiết", example = "Nhân khẩu nhập hộ ngày 01/01/2025", required = true)
    private String noiDung;

    @Schema(description = "Thời gian diễn ra biến động, mặc định = NOW nếu bỏ trống", example = "2024-01-01T10:00:00")
    private LocalDateTime thoiGian;

    @Schema(description = "ID hộ khẩu liên quan, cho phép null", example = "1")
    private Long hoKhauId;

    @Schema(description = "ID nhân khẩu liên quan, cho phép null", example = "10")
    private Long nhanKhauId;
}
