package com.example.QuanLyDanCu.entity;

import com.example.QuanLyDanCu.enums.BienDongType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private BienDongType loai;              // ENUM stored as VARCHAR

    @Column(name = "noi_dung", length = 1000)
    private String noiDung;                 // VARCHAR(1000)

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;         // TIMESTAMP

    // FK dạng Long
    @Column(name = "ho_khau_id")
    private Long hoKhauId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "ho_khau_id",
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(
                name = "fk_bien_dong_ho_khau",
                foreignKeyDefinition = "FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id) ON DELETE CASCADE"
            )
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private HoKhau hoKhau;

    @Column(name = "nhan_khau_id")
    private Long nhanKhauId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "nhan_khau_id",
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(
                    name = "fk_biendong_nhankhau",
                    foreignKeyDefinition = "FOREIGN KEY (nhan_khau_id) REFERENCES nhan_khau(id) ON DELETE CASCADE"
            )
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private NhanKhau nhanKhau;


    @PrePersist
    void onCreate() {
        if (thoiGian == null) thoiGian = LocalDateTime.now();
    }
}
