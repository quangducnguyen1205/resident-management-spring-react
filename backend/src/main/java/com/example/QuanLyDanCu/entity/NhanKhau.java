package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

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

    @Column(name = "que_quan")
    private String queQuan;

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

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(
            name = "ho_khau_id",
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(
                name = "fk_nhan_khau_ho_khau",
                foreignKeyDefinition = "FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id) ON DELETE CASCADE"
            )
        )
        @OnDelete(action = OnDeleteAction.CASCADE)
        private HoKhau hoKhau;

    @Column(name = "trang_thai")
    private String trangThai;
}
