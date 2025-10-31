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
@Builder(toBuilder = true)
public class NhanKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Thông tin cá nhân =====
    @Column(name = "ho_ten")
    private String hoTen;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "gioi_tinh")
    private String gioiTinh;

    @Column(name = "dan_toc")
    private String danToc;

    @Column(name = "quoc_tich")
    private String quocTich;

    @Column(name = "nghe_nghiep")
    private String ngheNghiep;

    @Column(name = "cmnd_cccd")
    private String cmndCccd;

    @Column(name = "ngay_cap")
    private LocalDate ngayCap;

    @Column(name = "noi_cap")
    private String noiCap;

    // ===== Quan hệ/hộ khẩu =====
    @Column(name = "quan_he_chu_ho")
    private String quanHeChuHo;

    // ===== Ghi chú, tạm vắng/tạm trú =====
    @Column(name = "ghi_chu")
    private String ghiChu;

    @Column(name = "tam_vang_tu")
    private LocalDate tamVangTu;

    @Column(name = "tam_vang_den")
    private LocalDate tamVangDen;

    @Column(name = "tam_tru_tu")
    private LocalDate tamTruTu;

    @Column(name = "tam_tru_den")
    private LocalDate tamTruDen;

    // ===== Khóa ngoại (để dạng Long theo code hiện tại của bạn) =====
    @Column(name = "ho_khau_id")
    private Long hoKhauId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    // ===== Audit =====
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Auto timestamps =====
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
