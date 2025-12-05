package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HoKhauRepository extends JpaRepository<HoKhau, Long> { 
    List<HoKhau> findAllByOrderByIdAsc();
    boolean existsBySoHoKhau(String soHoKhau);
}
