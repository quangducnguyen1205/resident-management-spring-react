package com.example.QuanLyDanCu.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDto {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    @JsonProperty("username")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @JsonProperty("password")
    private String password;

    @NotBlank(message = "Vai trò (ADMIN, TOTRUONG, USER) không được để trống")
    @JsonProperty("role")
    private String role;

    @JsonProperty("hoTen")
    private String hoTen;

    @JsonProperty("email")
    private String email;

    @JsonProperty("soDienThoai")
    private String soDienThoai;
}
