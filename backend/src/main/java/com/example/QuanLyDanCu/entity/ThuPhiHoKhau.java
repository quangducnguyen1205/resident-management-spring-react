package com.example.QuanLyDanCu.entity;

import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "thu_phi_ho_khau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThuPhiHoKhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", nullable = false)
    private HoKhau hoKhau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dot_thu_phi_id", nullable = false)
    private DotThuPhi dotThuPhi;

    // Số người trong hộ (tính tự động, không bao gồm người tạm vắng)
    @Column(name = "so_nguoi")
    private Integer soNguoi;

    // Tổng phí phải nộp (tính tự động: 6000 * 12 * soNguoi)
    @Column(name = "tong_phi", precision = 15, scale = 2)
    private BigDecimal tongPhi;

    // Số tiền đã thu
    @Column(name = "so_tien_da_thu", precision = 15, scale = 2)
    private BigDecimal soTienDaThu;

    // Trạng thái: CHUA_NOP hoặc DA_NOP (tự động set khi soTienDaThu >= tongPhi)
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    private TrangThaiThuPhi trangThai;

    // Mô tả kỳ thu (vd: "Cả năm 2025")
    @Column(name = "period_description", length = 100)
    private String periodDescription;

    @Column(name = "ngay_thu")
    private LocalDate ngayThu;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "collected_by")
    private Long collectedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
