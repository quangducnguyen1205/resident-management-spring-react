package com.example.QuanLyDanCu.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for payment recording
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payment recording response")
public class PaymentResponseDto {
    
    @Schema(description = "ID của bản ghi thanh toán", example = "1")
    private Long paymentId;
    
    @Schema(description = "ID của hộ khẩu", example = "1")
    private Long hoKhauId;
    
    @Schema(description = "Số hộ khẩu", example = "HK001")
    private String soHoKhau;
    
    @Schema(description = "Tên chủ hộ", example = "Nguyen Van A")
    private String tenChuHo;
    
    @Schema(description = "ID của đợt thu phí", example = "2")
    private Long dotThuPhiId;
    
    @Schema(description = "Tên đợt thu phí", example = "Phí Quản Lý Q4/2024")
    private String tenDot;
    
    @Schema(description = "Số nhân khẩu tại thời điểm thu", example = "3")
    private Integer numOfPeople;
    
    @Schema(description = "Danh sách tháng đã thanh toán", example = "[10, 11, 12]")
    private List<Integer> months;
    
    @Schema(description = "Số tháng thanh toán", example = "3")
    private Integer monthsCount;
    
    @Schema(description = "Loại phí", example = "VS")
    private String feeType;
    
    @Schema(description = "Số tiền thanh toán", example = "54000.00")
    private BigDecimal amount;
    
    @Schema(description = "Thời gian thanh toán")
    private LocalDateTime paymentDate;
    
    @Schema(description = "Mã người thu", example = "admin")
    private String collectorId;
    
    @Schema(description = "Ghi chú", example = "Thanh toán đầy đủ")
    private String notes;
    
    @Schema(description = "Thông báo kết quả", example = "Ghi nhận thanh toán thành công")
    private String message;
}
