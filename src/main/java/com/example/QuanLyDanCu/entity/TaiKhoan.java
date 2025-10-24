package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tai_khoan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_dang_nhap", unique = true)
    private String tenDangNhap;

    private String matKhau;
    private String vaiTro;
    private String hoTen;
    private String email;
    private LocalDateTime ngayTao;
    private String trangThai;
}
