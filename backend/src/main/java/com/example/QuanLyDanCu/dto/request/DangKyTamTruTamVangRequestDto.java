package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO để đăng ký tạm vắng cho một nhân khẩu")
public class DangKyTamTruTamVangRequestDto {

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @FutureOrPresent(message = "Ngày bắt đầu phải là ngày hiện tại hoặc trong tương lai")
    @Schema(description = "Ngày bắt đầu tạm vắng (yyyy-MM-dd)", example = "2025-11-15")
    private LocalDate ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc dự kiến phải là một ngày trong tương lai")
    @Schema(description = "Ngày kết thúc dự kiến (yyyy-MM-dd)", example = "2026-05-15")
    private LocalDate ngayKetThuc;

    @NotBlank(message = "Lý do tạm vắng không được để trống")
    @Schema(description = "Lý do đăng ký tạm vắng (ví dụ: Về quê, Công tác, Du lịch...)",
            example = "Về quê thăm gia đình")
    private String lyDo;
}