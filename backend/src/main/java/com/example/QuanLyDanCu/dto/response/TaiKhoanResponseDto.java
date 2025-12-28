package com.example.QuanLyDanCu.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Response DTO for TaiKhoan entity")
public class TaiKhoanResponseDto {
    
    @Schema(description = "ID tài khoản", example = "1")
    private Long id;

    @Schema(description = "Tên đăng nhập", example = "admin123")
    private String tenDangNhap;

    @Schema(description = "Vai trò", example = "ADMIN", allowableValues = {"ADMIN", "TOTRUONG", "KETOAN"})
    private String vaiTro;

    @Schema(description = "Họ tên", example = "Nguyễn Văn A")
    private String hoTen;

    @Schema(description = "Email", example = "admin@example.com")
    private String email;

    @Schema(description = "Ngày tạo", example = "2025-01-01T10:00:00")
    private LocalDateTime ngayTao;

}
