package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bien_dong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BienDong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String loai;
    private String noiDung;
    private LocalDateTime thoiGian;

    @ManyToOne
    @JoinColumn(name = "ho_khau_id")
    private HoKhau hoKhau;

    @ManyToOne
    @JoinColumn(name = "nhan_khau_id")
    private NhanKhau nhanKhau;

    private Long createdBy;
    private LocalDateTime createdAt;
}
