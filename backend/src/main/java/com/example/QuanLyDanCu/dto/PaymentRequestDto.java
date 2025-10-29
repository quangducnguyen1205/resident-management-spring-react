package com.example.QuanLyDanCu.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for recording a payment
 * Aligned with business rules: thu_phi_business_rules.md Section 6
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payment recording request")
public class PaymentRequestDto {
    
    @NotNull(message = "Mã hộ khẩu không được để trống")
    @Schema(description = "ID của hộ khẩu", example = "1", required = true)
    private Long hoKhauId;
    
    @NotNull(message = "Mã đợt thu phí không được để trống")
    @Schema(description = "ID của đợt thu phí", example = "2", required = true)
    private Long dotThuPhiId;
    
    @NotEmpty(message = "Danh sách tháng không được để trống")
    @Size(min = 1, max = 12, message = "Số tháng phải từ 1 đến 12")
    @Schema(description = "Danh sách các tháng thanh toán", example = "[10, 11, 12]", required = true)
    private List<@Min(value = 1, message = "Tháng phải từ 1-12") 
                  @Max(value = 12, message = "Tháng phải từ 1-12") Integer> months;
    
    @NotBlank(message = "Loại phí không được để trống")
    @Pattern(regexp = "^(VS|DG|DV)$", message = "Loại phí phải là VS (Vệ sinh), DG (Đóng góp), hoặc DV (Dịch vụ)")
    @Schema(description = "Loại phí: VS (Vệ sinh), DG (Đóng góp), DV (Dịch vụ)", 
            example = "VS", required = true)
    private String feeType;
    
    @NotBlank(message = "Mã người thu không được để trống")
    @Schema(description = "Mã định danh của người thu phí", example = "admin", required = true)
    private String collectorId;
    
    @Schema(description = "Số tiền thanh toán (chỉ dùng cho đóng góp tự nguyện)", 
            example = "100000")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;
    
    @Schema(description = "Ghi chú cho thanh toán", example = "Thanh toán đầy đủ")
    @Size(max = 500, message = "Ghi chú không được quá 500 ký tự")
    private String notes;
}
