package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NhanKhauRepository extends JpaRepository<NhanKhau, Long> {
    // --- Search theo tên (contains, không phân biệt hoa-thường)
    List<NhanKhau> findByHoTenContainingIgnoreCase(String keyword);

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

    // --- Projection cho thống kê theo nhóm tuổi + giới tính
    interface AgeBucketGenderCount {
        String getBucket();   // "CHILD" | "WORKING" | "RETIRED"
        String getGioiTinh(); // Nam/Nữ/Khác/null
        Long getTotal();
    }

    @Query("""
        SELECT
          CASE
            WHEN n.ngaySinh > :cutoffChild  THEN 'CHILD'
            WHEN n.ngaySinh > :cutoffRetire THEN 'WORKING'
            ELSE 'RETIRED'
          END AS bucket,
          n.gioiTinh AS gioiTinh,
          COUNT(n)   AS total
        FROM NhanKhau n
        WHERE n.ngaySinh IS NOT NULL
        GROUP BY
          CASE
            WHEN n.ngaySinh > :cutoffChild  THEN 'CHILD'
            WHEN n.ngaySinh > :cutoffRetire THEN 'WORKING'
            ELSE 'RETIRED'
          END,
          n.gioiTinh
        """)
    List<AgeBucketGenderCount> countByAgeBuckets(
            @Param("cutoffChild") LocalDate cutoffChild,
            @Param("cutoffRetire") LocalDate cutoffRetire
    );
}
