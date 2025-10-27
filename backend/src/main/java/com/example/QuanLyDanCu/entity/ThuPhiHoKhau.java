package com.example.QuanLyDanCu.entity;

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

    @Column(precision = 15, scale = 2)
    private BigDecimal soTienDaThu;

    private LocalDate ngayThu;
    private String months;
    private String ghiChu;

    private Long collectedBy;
    private LocalDateTime createdAt;
}
