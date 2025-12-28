package com.example.QuanLyDanCu.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "Vai trò (ADMIN, TOTRUONG, KETOAN) không được để trống")
    @JsonProperty("role")
    private String role;

    @JsonProperty("hoTen")
    private String hoTen;

    @Email(message = "Email không hợp lệ")
    @JsonProperty("email")
    private String email;

    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải từ 10 đến 11 số")
    @JsonProperty("soDienThoai")
    private String soDienThoai;
}
