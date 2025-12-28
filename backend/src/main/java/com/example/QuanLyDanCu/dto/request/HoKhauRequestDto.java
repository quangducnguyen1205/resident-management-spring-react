package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Request DTO for HoKhau entity")
public class HoKhauRequestDto {

    @NotBlank(message = "Số hộ khẩu không được để trống")
    @Schema(description = "Số hộ khẩu (unique)", example = "HK001")
    private String soHoKhau;

    @NotBlank(message = "Tên chủ hộ không được để trống")
    @Schema(description = "Tên chủ hộ", example = "Nguyễn Văn A")
    private String tenChuHo;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Schema(description = "Địa chỉ hộ khẩu", example = "123 Đường ABC, Quận XYZ")
    private String diaChi;
}
