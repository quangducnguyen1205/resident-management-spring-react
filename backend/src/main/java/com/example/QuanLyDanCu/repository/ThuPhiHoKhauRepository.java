package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.ThuPhiHoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThuPhiHoKhauRepository extends JpaRepository<ThuPhiHoKhau, Long> {
    List<ThuPhiHoKhau> findByHoKhauId(Long hoKhauId);
    List<ThuPhiHoKhau> findByDotThuPhiId(Long dotThuPhiId);
    
    /**
     * Find all payment records for a specific household and fee period.
     * Used to calculate total paid amount when multiple partial payments exist.
     */
    List<ThuPhiHoKhau> findByHoKhauIdAndDotThuPhiId(Long hoKhauId, Long dotThuPhiId);
}
