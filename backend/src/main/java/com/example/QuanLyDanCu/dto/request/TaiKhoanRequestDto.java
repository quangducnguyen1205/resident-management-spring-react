package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Request DTO for TaiKhoan registration")
public class TaiKhoanRequestDto {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    @Schema(description = "Tên đăng nhập (unique)", example = "user123")
    private String tenDangNhap;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Schema(description = "Mật khẩu", example = "password123")
    private String matKhau;

    @NotBlank(message = "Họ tên không được để trống")
    @Schema(description = "Họ tên đầy đủ", example = "Nguyễn Văn A")
    private String hoTen;

    @Schema(description = "Email", example = "user@example.com")
    private String email;

    @Schema(description = "Vai trò (ADMIN, TOTRUONG, USER)", example = "USER")
    private String vaiTro;
}
