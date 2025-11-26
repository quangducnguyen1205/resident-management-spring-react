package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "ho_khau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoKhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, updatable = false)
    private String soHoKhau;

    private String tenChuHo;
    private String diaChi;
    private LocalDate ngayTao;

    @OneToMany(mappedBy = "hoKhauId")
    private List<NhanKhau> nhanKhauList;
}
