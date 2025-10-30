package com.example.QuanLyDanCu.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @JsonProperty("username")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @JsonProperty("password")
    private String password;
}
