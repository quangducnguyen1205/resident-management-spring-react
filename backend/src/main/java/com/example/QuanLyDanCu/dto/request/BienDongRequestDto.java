package com.example.QuanLyDanCu.dto.request;

import com.example.QuanLyDanCu.enums.BienDongType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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

        private static final String ALLOWED_TYPES_MESSAGE = BienDongType.allowedValues();

    @NotBlank(message = "Loại biến động không được để trống")
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

    public BienDongType toBienDongType() {
        try {
            return BienDongType.fromString(loai);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Loại biến động phải thuộc: " + ALLOWED_TYPES_MESSAGE);
        }
    }
}
