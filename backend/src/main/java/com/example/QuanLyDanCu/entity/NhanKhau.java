package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhan_khau")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hoTen;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String danToc;
    private String quocTich;
    private String ngheNghiep;
    private String cmndCccd;
    private LocalDate ngayCap;
    private String noiCap;

    @Column(name = "ho_khau_id")
    private Long hoKhauId;

    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
