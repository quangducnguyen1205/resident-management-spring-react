package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.DotThuPhi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DotThuPhiRepository extends JpaRepository<DotThuPhi, Long> {
    boolean existsByTenDot(String tenDot);
}
