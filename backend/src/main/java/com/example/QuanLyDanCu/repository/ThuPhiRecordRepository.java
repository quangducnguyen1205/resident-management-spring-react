package com.example.QuanLyDanCu.repository;

import com.example.QuanLyDanCu.entity.ThuPhiRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for ThuPhiRecord entity
 * Handles payment record queries and aggregations
 */
@Repository
public interface ThuPhiRecordRepository extends JpaRepository<ThuPhiRecord, Long> {
    
    /**
     * Find all payment records for a specific household
     */
    List<ThuPhiRecord> findByHoKhauId(Long hoKhauId);
    
    /**
     * Find all payment records for a specific fee period
     */
    List<ThuPhiRecord> findByDotThuPhiId(Long dotThuPhiId);
    
    /**
     * Find payment records by household and fee period
     */
    List<ThuPhiRecord> findByHoKhauIdAndDotThuPhiId(Long hoKhauId, Long dotThuPhiId);
    
    /**
     * Find payment records by fee type
     */
    List<ThuPhiRecord> findByFeeType(String feeType);
    
    /**
     * Check if a household has already paid for specific months in a fee period
     * Returns records where the months string contains the specified month
     */
    @Query("SELECT r FROM ThuPhiRecord r WHERE r.hoKhauId = :hoKhauId " +
           "AND r.dotThuPhiId = :dotThuPhiId " +
           "AND r.months LIKE %:month%")
    List<ThuPhiRecord> findByHoKhauAndDotThuPhiAndMonth(
        @Param("hoKhauId") Long hoKhauId,
        @Param("dotThuPhiId") Long dotThuPhiId,
        @Param("month") String month
    );
    
    /**
     * Calculate total collected amount for a fee period
     */
    @Query("SELECT SUM(r.amount) FROM ThuPhiRecord r WHERE r.dotThuPhiId = :dotThuPhiId")
    BigDecimal sumAmountByDotThuPhiId(@Param("dotThuPhiId") Long dotThuPhiId);
    
    /**
     * Calculate total collected amount for a fee period and fee type
     */
    @Query("SELECT SUM(r.amount) FROM ThuPhiRecord r " +
           "WHERE r.dotThuPhiId = :dotThuPhiId AND r.feeType = :feeType")
    BigDecimal sumAmountByDotThuPhiIdAndFeeType(
        @Param("dotThuPhiId") Long dotThuPhiId,
        @Param("feeType") String feeType
    );
    
    /**
     * Count distinct households that have paid for a fee period
     */
    @Query("SELECT COUNT(DISTINCT r.hoKhauId) FROM ThuPhiRecord r " +
           "WHERE r.dotThuPhiId = :dotThuPhiId")
    Long countDistinctHouseholdsByDotThuPhiId(@Param("dotThuPhiId") Long dotThuPhiId);
    
    /**
     * Count distinct households that have paid for a fee period and fee type
     */
    @Query("SELECT COUNT(DISTINCT r.hoKhauId) FROM ThuPhiRecord r " +
           "WHERE r.dotThuPhiId = :dotThuPhiId AND r.feeType = :feeType")
    Long countDistinctHouseholdsByDotThuPhiIdAndFeeType(
        @Param("dotThuPhiId") Long dotThuPhiId,
        @Param("feeType") String feeType
    );
    
    /**
     * Find payment records by fee period and fee type where months contains specified month
     */
    @Query("SELECT r FROM ThuPhiRecord r " +
           "WHERE r.dotThuPhiId = :dotThuPhiId " +
           "AND r.feeType = :feeType " +
           "AND r.months LIKE %:month%")
    List<ThuPhiRecord> findByDotThuPhiIdAndFeeTypeAndMonth(
        @Param("dotThuPhiId") Long dotThuPhiId,
        @Param("feeType") String feeType,
        @Param("month") String month
    );
}
