package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NhanKhauRepository extends JpaRepository<NhanKhau, Long> {
  // --- Search theo tên hoặc CCCD (contains, không phân biệt hoa-thường)
  @Query("SELECT n FROM NhanKhau n WHERE LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR n.cmndCccd LIKE CONCAT('%', :keyword, '%')")
  List<NhanKhau> findByHoTenContainingIgnoreCase(@Param("keyword") String keyword);

  // --- Tìm nhân khẩu theo hộ khẩu
  List<NhanKhau> findByHoKhauId(Long hoKhauId);

  List<NhanKhau> findAllByOrderByIdAsc();

  List<NhanKhau> findByHoKhauIdOrderByIdAsc(Long hoKhauId);

  // --- Kiểm tra CCCD có tồn tại không (trả về boolean để tránh lỗi unique
  // result)
  boolean existsByCmndCccd(String cmndCccd);

  @Query("""
      SELECT COUNT(n)
      FROM NhanKhau n
      WHERE n.hoKhauId = :hoKhauId
        AND (n.tamVangDen IS NULL OR n.tamVangDen < :today)
        AND (n.trangThai IS NULL OR n.trangThai <> 'KHAI_TU')
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
      WHERE n.trangThai IS NULL OR n.trangThai <> 'KHAI_TU'
      GROUP BY n.gioiTinh
      """)
  List<GenderCount> countByGioiTinh();

  // --- Projection cho thống kê trang thái
  interface StatusCount {
    String getTrangThai();

    Long getTotal();
  }

  @Query("""
          SELECT n.trangThai AS trangThai, COUNT(n) AS total
          FROM NhanKhau n
          WHERE n.trangThai IS NULL OR n.trangThai <> 'KHAI_TU'
          GROUP BY n.trangThai
      """)
  List<StatusCount> countByTrangThai();

  long countByHoKhauId(Long hoKhauId);

  // Đếm số thành viên chưa bị khai tử (active)
  @Query("SELECT COUNT(n) FROM NhanKhau n WHERE n.hoKhauId = :hoKhauId AND (n.trangThai IS NULL OR n.trangThai <> :trangThai)")
  long countActiveMembersExcludeStatus(@Param("hoKhauId") Long hoKhauId, @Param("trangThai") String trangThai);

  // Tìm chủ hộ hiện tại của 1 hộ khẩu
  List<NhanKhau> findByHoKhauIdAndQuanHeChuHo(Long hoKhauId, String quanHeChuHo);
}
