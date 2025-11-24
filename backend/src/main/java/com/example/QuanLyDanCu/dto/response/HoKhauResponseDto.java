package com.example.QuanLyDanCu.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Response DTO for HoKhau entity")
public class HoKhauResponseDto {

    @Schema(description = "ID hộ khẩu", example = "1")
    private Long id;

    @Schema(description = "Số hộ khẩu", example = "HK001")
    private String soHoKhau;

    @Schema(description = "Tên chủ hộ", example = "Nguyễn Văn A")
    private String tenChuHo;

    @Schema(description = "Địa chỉ", example = "123 Đường ABC")
    private String diaChi;

    @Schema(description = "Ngày tạo hộ khẩu")
    private LocalDate ngayTao;

    @Schema(description = "Nội dung thay đổi chủ hộ")
    private String noiDungThayDoiChuHo;

    @Schema(description = "Ngày thay đổi chủ hộ")
    private LocalDate ngayThayDoiChuHo;

    @Schema(description = "ID người tạo")
    private Long createdBy;

    @Schema(description = "ID người cập nhật")
    private Long updatedBy;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime updatedAt;

    @Schema(description = "Số thành viên trong hộ khẩu", example = "4")
    private Integer soThanhVien;

    @Schema(description = "Danh sách nhân khẩu thuộc hộ khẩu")
    private List<NhanKhauResponseDto> listNhanKhau;
}
