package com.example.QuanLyDanCu.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for BienDong entity")
public class BienDongResponseDto {

    @JsonProperty("id")
    @Schema(description = "ID biến động", example = "1")
    private Long id;

    @JsonProperty("loai")
    @Schema(description = "Loại biến động", example = "Tạm trú")
    private String loai;

    @JsonProperty("noiDung")
    @Schema(description = "Nội dung biến động", example = "Nhân khẩu đăng ký tạm trú từ 01/01/2024")
    private String noiDung;

    @JsonProperty("thoiGian")
    @Schema(description = "Thời gian biến động")
    private LocalDateTime thoiGian;

    @JsonProperty("hoKhauId")
    @Schema(description = "ID hộ khẩu liên quan")
    private Long hoKhauId;

    @JsonProperty("nhanKhauId")
    @Schema(description = "ID nhân khẩu liên quan")
    private Long nhanKhauId;

    @JsonProperty("createdBy")
    @Schema(description = "ID người tạo")
    private Long createdBy;

    @JsonProperty("createdAt")
    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
}
