package com.example.QuanLyDanCu.entity;

import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dot_thu_phi")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
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

    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "dotThuPhi", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ThuPhiHoKhau> danhSachThuPhi = new ArrayList<>();
}
