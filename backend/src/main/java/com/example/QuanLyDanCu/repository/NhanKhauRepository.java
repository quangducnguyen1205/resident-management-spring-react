package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NhanKhauRepository extends JpaRepository<NhanKhau, Long> {
    // --- Search theo tên hoặc CCCD (contains, không phân biệt hoa-thường)
    @Query("SELECT n FROM NhanKhau n WHERE LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR n.cmndCccd LIKE CONCAT('%', :keyword, '%')")
    List<NhanKhau> findByHoTenContainingIgnoreCase(@Param("keyword") String keyword);

    // --- Tìm nhân khẩu theo hộ khẩu
    List<NhanKhau> findByHoKhauId(Long hoKhauId);
    List<NhanKhau> findAllByOrderByIdAsc();
    List<NhanKhau> findByHoKhauIdOrderByIdAsc(Long hoKhauId);


    @Query("""
            SELECT COUNT(n)
            FROM NhanKhau n
            WHERE n.hoKhauId = :hoKhauId
              AND (n.tamVangDen IS NULL OR n.tamVangDen < :today)
            """)
    long countActiveMembers(@Param("hoKhauId") Long hoKhauId, @Param("today") LocalDate today);

    // --- Projection cho thống kê giới tính
    interface GenderCount {
        String getGioiTinh();
        Long getTotal();
    }

    @Query("""
           SELECT n.gioiTinh AS gioiTinh, COUNT(n) AS total
           FROM NhanKhau n
           GROUP BY n.gioiTinh
           """)
    List<GenderCount> countByGioiTinh();
}
