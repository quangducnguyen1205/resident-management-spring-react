package com.example.QuanLyDanCu.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO for partial updates of HoKhau entity.
 * All fields are nullable - only provided fields will be updated.
 * Note: soHoKhau cannot be updated as it is immutable.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Update DTO for HoKhau entity (chỉ các trường được cung cấp)")
public class HoKhauUpdateDto {

    @Schema(description = "Tên chủ hộ", example = "Nguyễn Văn A")
    private String tenChuHo;

    @Schema(description = "Địa chỉ hộ khẩu", example = "123 Đường ABC, Quận XYZ")
    private String diaChi;
}
