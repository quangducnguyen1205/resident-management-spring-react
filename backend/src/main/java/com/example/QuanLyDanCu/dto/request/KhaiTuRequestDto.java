package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KhaiTuRequestDto {

    @NotBlank(message = "Lý do khai tử không được để trống")
    @Schema(description = "Lý do khai tử", example = "Mắc bệnh nặng")
    private String lyDo;
}