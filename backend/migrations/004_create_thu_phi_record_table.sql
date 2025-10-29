-- ============================================================================
-- Phase 4: Business Rules Alignment - ThuPhiRecord Table Migration
-- Author: Development Team
-- Date: 2025-10-29
-- Description: Create thu_phi_record table for payment tracking aligned with
--              business rules document (thu_phi_business_rules.md)
-- ============================================================================

CREATE TABLE IF NOT EXISTS thu_phi_record (
    id BIGSERIAL PRIMARY KEY,
    
    -- References
    ho_khau_id BIGINT NOT NULL,
    dot_thu_phi_id BIGINT NOT NULL,
    
    -- Payment details
    num_of_people INTEGER NOT NULL CHECK (num_of_people > 0),
    months VARCHAR(100) NOT NULL,  -- Comma-separated months, e.g., "10,11,12"
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Collector info
    collector_id VARCHAR(50) NOT NULL,
    
    -- Fee type: VS (Vệ sinh), DG (Đóng góp), DV (Dịch vụ)
    fee_type VARCHAR(10) NOT NULL CHECK (fee_type IN ('VS', 'DG', 'DV')),
    
    -- Optional notes
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_thu_phi_record_ho_khau 
        FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id) ON DELETE CASCADE,
    CONSTRAINT fk_thu_phi_record_dot_thu_phi 
        FOREIGN KEY (dot_thu_phi_id) REFERENCES dot_thu_phi(id) ON DELETE CASCADE
    -- Note: collector_id is stored as username string for flexibility
);

-- Indexes for performance
CREATE INDEX idx_thu_phi_record_ho_khau ON thu_phi_record(ho_khau_id);
CREATE INDEX idx_thu_phi_record_dot_thu_phi ON thu_phi_record(dot_thu_phi_id);
CREATE INDEX idx_thu_phi_record_fee_type ON thu_phi_record(fee_type);
CREATE INDEX idx_thu_phi_record_payment_date ON thu_phi_record(payment_date);
CREATE INDEX idx_thu_phi_record_months ON thu_phi_record(months);  -- For month-based queries

-- Comments
COMMENT ON TABLE thu_phi_record IS 'Payment records for household fees aligned with business rules';
COMMENT ON COLUMN thu_phi_record.num_of_people IS 'Number of household members at time of payment';
COMMENT ON COLUMN thu_phi_record.months IS 'Comma-separated month numbers paid for (e.g., "10,11,12")';
COMMENT ON COLUMN thu_phi_record.fee_type IS 'VS=Sanitation(6000/person/month), DG=Voluntary, DV=Service';
COMMENT ON COLUMN thu_phi_record.amount IS 'Total amount paid in VND';

-- Sample data for testing
INSERT INTO thu_phi_record (ho_khau_id, dot_thu_phi_id, num_of_people, months, amount, payment_date, collector_id, fee_type, notes)
SELECT 
    1,  -- ho_khau_id (assuming HoKhau with id=1 exists)
    1,  -- dot_thu_phi_id (assuming DotThuPhi with id=1 exists)
    3,  -- num_of_people
    '10,11,12',  -- months
    54000.00,  -- amount (3 people * 6000 * 3 months)
    CURRENT_TIMESTAMP,
    'admin',  -- collector_id
    'VS',  -- fee_type (Sanitation)
    'Sample payment for testing'
WHERE EXISTS (SELECT 1 FROM ho_khau WHERE id = 1)
  AND EXISTS (SELECT 1 FROM dot_thu_phi WHERE id = 1)
  AND EXISTS (SELECT 1 FROM tai_khoan WHERE ten_dang_nhap = 'admin')
  AND NOT EXISTS (SELECT 1 FROM thu_phi_record WHERE ho_khau_id = 1 AND dot_thu_phi_id = 1 AND months = '10,11,12');

-- ============================================================================
-- End of migration
-- ============================================================================
