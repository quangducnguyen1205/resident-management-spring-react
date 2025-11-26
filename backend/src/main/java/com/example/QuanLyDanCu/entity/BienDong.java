package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bien_dong")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BienDong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String loai;                    // VARCHAR(100)

    @Column(name = "noi_dung", length = 1000)
    private String noiDung;                 // VARCHAR(1000)

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;         // TIMESTAMP

    // FK dạng Long
    @Column(name = "ho_khau_id")
    private Long hoKhauId;

    @Column(name = "nhan_khau_id")
    private Long nhanKhauId;

    @PrePersist
    void onCreate() {
        if (thoiGian == null) thoiGian = LocalDateTime.now();
    }
}
