package com.example.QuanLyDanCu.entity;

import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dot_thu_phi")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DotThuPhi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenDot;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", length = 20)
    private LoaiThuPhi loai;

    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;

    @Column(precision = 15, scale = 2)
    private BigDecimal dinhMuc;

    // True: Thu theo đợt (Flat fee: Amount/Person/Period)
    // False/Null: Thu theo tháng (Amount/Person/Month * Months)
    @Column(name = "thu_theo_dot")
    private Boolean thuTheoDot;

    @OneToMany(mappedBy = "dotThuPhi", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ThuPhiHoKhau> danhSachThuPhi = new ArrayList<>();
}
