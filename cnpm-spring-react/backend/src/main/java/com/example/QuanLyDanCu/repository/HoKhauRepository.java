package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface HoKhauRepository extends JpaRepository<HoKhau, Long> {
    List<HoKhau> findAllByOrderByIdAsc();

    @org.springframework.data.jpa.repository.Query("SELECT h FROM HoKhau h WHERE h.isDeleted = false OR h.isDeleted IS NULL ORDER BY h.id ASC")
    List<HoKhau> findActiveHouseholds();

    boolean existsBySoHoKhau(String soHoKhau);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE HoKhau h SET h.tenChuHo = :tenChuHo WHERE h.id = :id")
    void updateTenChuHo(@Param("id") Long id, @Param("tenChuHo") String tenChuHo);
}
