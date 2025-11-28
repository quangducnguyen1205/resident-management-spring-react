package com.example.QuanLyDanCu.entity;

import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

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

    /**
     * Số người trong hộ (tính tự động, không bao gồm người tạm vắng)
     * - Phí BAT_BUOC: Tính theo số người thực tế trong hộ
     * - Phí TU_NGUYEN: Luôn = 0 (không tính theo số người)
     */
    @Column(name = "so_nguoi")
    private Integer soNguoi;

    /**
     * Tổng phí phải nộp (tính tự động)
     * - Phí BAT_BUOC: dinh_muc * months * soNguoi (months calculated from period dates)
     * - Phí TU_NGUYEN: Luôn = 0 (không bắt buộc, người dân tự nguyện đóng góp)
     */
    @Column(name = "tong_phi", precision = 15, scale = 2)
    private BigDecimal tongPhi;

    /**
     * Trạng thái thu phí
     * - CHUA_NOP: Phí BAT_BUOC chưa nộp (initial state)
     * - DA_NOP: Phí BAT_BUOC đã nộp đủ (one-time full payment)
     * - KHONG_AP_DUNG: Phí TU_NGUYEN (not applicable)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    private TrangThaiThuPhi trangThai;

    @Column(name = "ngay_thu")
    private LocalDate ngayThu;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "collected_by")
    private Long collectedBy;

}
