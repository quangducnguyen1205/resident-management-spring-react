package com.example.QuanLyDanCu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a payment record for household fees
 * Aligned with business rules document: thu_phi_business_rules.md
 */
@Entity
@Table(name = "thu_phi_record")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThuPhiRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Reference to HoKhau (Household)
     */
    @Column(name = "ho_khau_id", nullable = false)
    private Long hoKhauId;
    
    /**
     * Reference to DotThuPhi (Fee Period)
     */
    @Column(name = "dot_thu_phi_id", nullable = false)
    private Long dotThuPhiId;
    
    /**
     * Number of people in household at time of payment
     */
    @Column(name = "num_of_people", nullable = false)
    private Integer numOfPeople;
    
    /**
     * Months paid for (stored as comma-separated string, e.g., "10,11,12")
     * Represents which months this payment covers
     */
    @Column(name = "months", nullable = false, length = 100)
    private String months;
    
    /**
     * Total amount paid (in VND)
     * Must be > 0
     */
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    /**
     * Timestamp when payment was recorded
     */
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    
    /**
     * ID of the collector who recorded this payment
     * References TaiKhoan.username
     */
    @Column(name = "collector_id", nullable = false, length = 50)
    private String collectorId;
    
    /**
     * Type of fee:
     * - "VS" = Phí vệ sinh (Sanitation fee) - calculated by formula
     * - "DG" = Đóng góp (Voluntary contribution) - free amount
     * - "DV" = Phí dịch vụ (Service fee) - optional
     */
    @Column(name = "fee_type", nullable = false, length = 10)
    private String feeType;
    
    /**
     * Optional notes about this payment
     */
    @Column(name = "notes", length = 500)
    private String notes;
    
    /**
     * Audit fields
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
