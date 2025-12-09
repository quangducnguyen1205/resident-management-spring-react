package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
    
    // Kiểm tra email có tồn tại không (trả về boolean để tránh lỗi unique result)
    boolean existsByEmail(String email);
}
