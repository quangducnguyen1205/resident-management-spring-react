package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ho_khau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoKhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String soHoKhau;

    private String tenChuHo;
    private String diaChi;
    private LocalDate ngayTao;
    private String noiDungThayDoiChuHo;
    private LocalDate ngayThayDoiChuHo;

    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "hoKhauId")
    private List<NhanKhau> nhanKhauList;
}
