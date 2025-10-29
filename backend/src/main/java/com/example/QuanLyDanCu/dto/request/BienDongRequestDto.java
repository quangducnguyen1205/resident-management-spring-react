package com.example.QuanLyDanCu.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
@Schema(description = "Request DTO for BienDong entity")
public class BienDongRequestDto {

    @NotBlank(message = "Loại biến động không được để trống")
    @Size(max = 100, message = "Loại biến động không được vượt quá 100 ký tự")
    @JsonProperty("loai")
    @Schema(description = "Loại biến động", example = "Tạm trú", required = true)
    private String loai;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 1000, message = "Nội dung không được vượt quá 1000 ký tự")
    @JsonProperty("noiDung")
    @Schema(description = "Nội dung biến động", example = "Nhân khẩu đăng ký tạm trú từ 01/01/2024", required = true)
    private String noiDung;

    @JsonProperty("thoiGian")
    @Schema(description = "Thời gian biến động", example = "2024-01-01T10:00:00")
    private LocalDateTime thoiGian;

    @JsonProperty("hoKhauId")
    @Schema(description = "ID hộ khẩu liên quan", example = "1")
    private Long hoKhauId;

    @JsonProperty("nhanKhauId")
    @Schema(description = "ID nhân khẩu liên quan", example = "1")
    private Long nhanKhauId;
}
