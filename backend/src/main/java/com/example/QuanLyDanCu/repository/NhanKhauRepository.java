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

    // --- Projection cho thống kê theo nhóm tuổi + giới tính
    interface AgeBucketGenderCount {
        String getBucket();   // "CHILD" | "WORKING" | "RETIRED"
        String getGioiTinh(); // Nam/Nữ/Khác/null
        Long getTotal();
    }

    @Query(nativeQuery = true, value = """
        WITH age_bucket AS (
          SELECT
            id,
            CASE
              WHEN ngay_sinh > :cutoffChild  THEN 'CHILD'
              WHEN ngay_sinh > :cutoffRetire THEN 'WORKING'
              ELSE 'RETIRED'
            END AS bucket,
            gioi_tinh
          FROM nhan_khau
          WHERE ngay_sinh IS NOT NULL
        )
        SELECT bucket, gioi_tinh AS gioiTinh, COUNT(*) AS total
        FROM age_bucket
        GROUP BY bucket, gioi_tinh
        """)
    List<AgeBucketGenderCount> countByAgeBuckets(
            @Param("cutoffChild") LocalDate cutoffChild,
            @Param("cutoffRetire") LocalDate cutoffRetire
    );
}
