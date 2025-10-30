-- ============================================================================
-- Seed Data for QuanLyDanCu Test Environment
-- Purpose: Generate realistic test data for integration testing
-- Author: Development Team
-- Date: October 29, 2025
-- ============================================================================

-- Clear existing test data (in correct order due to foreign keys)
TRUNCATE TABLE thu_phi_ho_khau CASCADE;
TRUNCATE TABLE bien_dong CASCADE;
TRUNCATE TABLE dot_thu_phi CASCADE;
TRUNCATE TABLE nhan_khau CASCADE;
TRUNCATE TABLE ho_khau CASCADE;
TRUNCATE TABLE tai_khoan CASCADE;

-- Reset sequences
ALTER SEQUENCE tai_khoan_id_seq RESTART WITH 1;
ALTER SEQUENCE ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE nhan_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE dot_thu_phi_id_seq RESTART WITH 1;
ALTER SEQUENCE bien_dong_id_seq RESTART WITH 1;
ALTER SEQUENCE thu_phi_ho_khau_id_seq RESTART WITH 1;

-- ============================================================================
-- 1. TAI_KHOAN (User Accounts)
-- Password: admin123 (BCrypt hash)
-- Column names: ten_dang_nhap, mat_khau, vai_tro, ho_ten, email, ngay_tao, trang_thai
-- ============================================================================

INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, ho_ten, email, ngay_tao, trang_thai) VALUES
-- Admin account
('admin', '$2a$10$XQxPpz5bGvEj.vGKZvzJp.7K8xQZvZ5Qp8k8L6jM4J4q8QxQxQxQx', 'ROLE_ADMIN', 'Nguyễn Quản Trị', 'admin@quanlydancu.vn', NOW(), 'ACTIVE'),

-- Neighborhood leaders (Tổ trưởng)
('totruong01', '$2a$10$XQxPpz5bGvEj.vGKZvzJp.7K8xQZvZ5Qp8k8L6jM4J4q8QxQxQxQx', 'ROLE_TOTRUONG', 'Trần Văn Tổ', 'totruong01@quanlydancu.vn', NOW(), 'ACTIVE'),
('totruong02', '$2a$10$XQxPpz5bGvEj.vGKZvzJp.7K8xQZvZ5Qp8k8L6jM4J4q8QxQxQxQx', 'ROLE_TOTRUONG', 'Lê Thị Lan', 'totruong02@quanlydancu.vn', NOW(), 'ACTIVE'),

-- Fee collectors (Kế toán)
('ketoan01', '$2a$10$XQxPpz5bGvEj.vGKZvzJp.7K8xQZvZ5Qp8k8L6jM4J4q8QxQxQxQx', 'ROLE_KETOAN', 'Phạm Văn Toán', 'ketoan01@quanlydancu.vn', NOW(), 'ACTIVE'),
('ketoan02', '$2a$10$XQxPpz5bGvEj.vGKZvzJp.7K8xQZvZ5Qp8k8L6jM4J4q8QxQxQxQx', 'ROLE_KETOAN', 'Hoàng Thị Hoa', 'ketoan02@quanlydancu.vn', NOW(), 'ACTIVE');

-- ============================================================================
-- 2. HO_KHAU (Households)
-- ============================================================================

INSERT INTO ho_khau (so_ho_khau, ten_chu_ho, dia_chi, ngay_tao, created_by, created_at, updated_at) VALUES
-- Working-age household (no discount)
('HK001', 'Nguyễn Văn An', '123 Đường Nguyễn Huệ, Quận 1', '2024-01-15', 1, NOW(), NOW()),

-- Elderly household (discount eligible)
('HK002', 'Trần Văn Bình', '456 Đường Lê Lợi, Quận 3', '2024-01-20', 1, NOW(), NOW()),

-- Student household (discount eligible)
('HK003', 'Lê Thị Cúc', '789 Đường Trần Hưng Đạo, Quận 5', '2024-02-01', 1, NOW(), NOW()),

-- Mixed-age household (discount eligible)
('HK004', 'Phạm Văn Dũng', '321 Đường Phan Đình Phùng, Quận Tân Bình', '2024-02-10', 1, NOW(), NOW()),

-- Large family (7 members)
('HK005', 'Hoàng Văn Em', '654 Đường Võ Văn Tần, Quận Phú Nhuận', '2024-03-01', 1, NOW(), NOW()),

-- Single person household
('HK006', 'Võ Thị Phượng', '987 Đường Cách Mạng Tháng 8, Quận 10', '2024-03-15', 1, NOW(), NOW()),

-- Temporarily absent household
('HK007', 'Đỗ Văn Giang', '147 Đường Hai Bà Trưng, Quận 1', '2024-04-01', 1, NOW(), NOW()),

-- New household
('HK008', 'Bùi Thị Hương', '258 Đường Điện Biên Phủ, Quận Bình Thạnh', '2024-10-01', 1, NOW(), NOW());

-- ============================================================================
-- 3. NHAN_KHAU (Citizens)
-- Ages: Elderly (≥60), Working-age (23-59), Students (≤22)
-- ============================================================================

-- HK001: Working-age household (3 members, no discount)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Nguyễn Văn An', '1985-05-10', 'Nam', '001085001234', 'Kỹ sư', 'Chủ hộ', 1, 1, NOW(), NOW()),
('Trần Thị Bích', '1988-08-15', 'Nu', '001088002345', 'Giáo viên', 'Vợ', 1, 1, NOW(), NOW()),
('Nguyễn Văn Cường', '2015-03-20', 'Nam', NULL, 'Học sinh', 'Con', 1, 1, NOW(), NOW());

-- HK002: Elderly household (4 members, discount eligible)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Trần Văn Bình', '1955-12-05', 'Nam', '001055003456', 'Về hưu', 'Chủ hộ', 2, 1, NOW(), NOW()),
('Lê Thị Dung', '1958-06-10', 'Nu', '001058004567', 'Nội trợ', 'Vợ', 2, 1, NOW(), NOW()),
('Trần Văn Em', '1985-09-15', 'Nam', '001085005678', 'Kỹ thuật viên', 'Con', 2, 1, NOW(), NOW()),
('Nguyễn Thị Phương', '1990-02-20', 'Nu', '001090006789', 'Y tá', 'Con dâu', 2, 1, NOW(), NOW());

-- HK003: Student household (3 members, discount eligible)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Lê Thị Cúc', '1975-04-12', 'Nu', '001075007890', 'Công nhân', 'Chủ hộ', 3, 1, NOW(), NOW()),
('Lê Văn Phúc', '2003-07-18', 'Nam', '001003008901', 'Sinh viên', 'Con', 3, 1, NOW(), NOW()),
('Lê Thị Quỳnh', '2008-11-25', 'Nu', NULL, 'Học sinh', 'Con', 3, 1, NOW(), NOW());

-- HK004: Mixed-age household (5 members, discount eligible)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Phạm Văn Dũng', '1970-08-22', 'Nam', '001070009012', 'Kinh doanh', 'Chủ hộ', 4, 1, NOW(), NOW()),
('Hoàng Thị Giang', '1972-11-30', 'Nu', '001072010123', 'Kế toán', 'Vợ', 4, 1, NOW(), NOW()),
('Phạm Thị Hoa', '1945-03-05', 'Nu', '001045011234', 'Về hưu', 'Mẹ', 4, 1, NOW(), NOW()),
('Phạm Văn Hùng', '2002-06-12', 'Nam', '001002012345', 'Sinh viên', 'Con', 4, 1, NOW(), NOW()),
('Phạm Thị Linh', '2012-09-20', 'Nu', NULL, 'Học sinh', 'Con', 4, 1, NOW(), NOW());

-- HK005: Large family (7 members)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Hoàng Văn Em', '1980-01-10', 'Nam', '001080013456', 'Thợ xây', 'Chủ hộ', 5, 1, NOW(), NOW()),
('Trần Thị Khánh', '1982-05-15', 'Nu', '001082014567', 'Nội trợ', 'Vợ', 5, 1, NOW(), NOW()),
('Hoàng Văn Long', '2005-08-20', 'Nam', '001005015678', 'Học sinh', 'Con', 5, 1, NOW(), NOW()),
('Hoàng Thị Mai', '2008-11-25', 'Nu', NULL, 'Học sinh', 'Con', 5, 1, NOW(), NOW()),
('Hoàng Văn Nam', '2011-02-28', 'Nam', NULL, 'Học sinh', 'Con', 5, 1, NOW(), NOW()),
('Hoàng Thị Oanh', '2014-06-15', 'Nu', NULL, 'Học sinh', 'Con', 5, 1, NOW(), NOW()),
('Lê Văn Minh', '1950-09-10', 'Nam', '001050016789', 'Về hưu', 'Ông nội', 5, 1, NOW(), NOW());

-- HK006: Single person (1 member)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Võ Thị Phượng', '1992-04-18', 'Nu', '001092017890', 'Nhân viên văn phòng', 'Chủ hộ', 6, 1, NOW(), NOW());

-- HK007: Temporarily absent (2 members)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Đỗ Văn Giang', '1987-07-22', 'Nam', '001087018901', 'Lái xe', 'Chủ hộ', 7, 1, NOW(), NOW()),
('Nguyễn Thị Hiền', '1989-10-30', 'Nu', '001089019012', 'Điều dưỡng', 'Vợ', 7, 1, NOW(), NOW());

-- HK008: New household (4 members)
INSERT INTO nhan_khau (ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, nghe_nghiep, quan_he_chu_ho, ho_khau_id, created_by, created_at, updated_at) VALUES
('Bùi Thị Hương', '1986-12-08', 'Nu', '001086020123', 'Dược sĩ', 'Chủ hộ', 8, 1, NOW(), NOW()),
('Phan Văn Kiên', '1984-03-15', 'Nam', '001084021234', 'Lập trình viên', 'Chồng', 8, 1, NOW(), NOW()),
('Bùi Văn Long', '2010-06-20', 'Nam', NULL, 'Học sinh', 'Con', 8, 1, NOW(), NOW()),
('Bùi Thị Mai', '2018-09-25', 'Nu', NULL, 'Học sinh', 'Con', 8, 1, NOW(), NOW());

-- ============================================================================
-- 4. DOT_THU_PHI (Fee Collection Periods)
-- Based on business rules: 6,000 VND per person per month
-- Column names: ten_dot, loai, ngay_bat_dau, ngay_ket_thuc, dinh_muc, created_by, created_at, updated_at
-- ============================================================================

INSERT INTO dot_thu_phi (ten_dot, loai, ngay_bat_dau, ngay_ket_thuc, dinh_muc, created_by, created_at, updated_at) VALUES
-- January 2025 - Sanitation Fee
('Phí vệ sinh tháng 1/2025', 'VE_SINH', '2025-01-01', '2025-01-31', 6000.00, 1, NOW(), NOW()),

-- February 2025 - Sanitation Fee
('Phí vệ sinh tháng 2/2025', 'VE_SINH', '2025-02-01', '2025-02-28', 6000.00, 1, NOW(), NOW()),

-- March 2025 - Sanitation Fee
('Phí vệ sinh tháng 3/2025', 'VE_SINH', '2025-03-01', '2025-03-31', 6000.00, 1, NOW(), NOW()),

-- Q1 2025 - Management Fee
('Phí quản lý Q1/2025', 'QUAN_LY', '2025-01-01', '2025-03-31', 50000.00, 1, NOW(), NOW()),

-- Q2 2025 - Management Fee
('Phí quản lý Q2/2025', 'QUAN_LY', '2025-04-01', '2025-06-30', 50000.00, 1, NOW(), NOW()),

-- Special contribution
('Đóng góp xây nhà văn hóa', 'DONG_GOP', '2025-01-01', '2025-12-31', 100000.00, 1, NOW(), NOW());

-- ============================================================================
-- 5. THU_PHI_HO_KHAU (Household Fee Payments)
-- Based on business rules: amount = num_of_people * 6000 * months
-- Column names: ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at
-- ============================================================================

-- HK001: 3 members, paid Jan-Feb (no discount)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(1, 1, 18000.00, '2025-01-15', '1', 4, 'Đã thanh toán đủ tháng 1', NOW()),
(1, 2, 18000.00, '2025-02-18', '2', 4, 'Đã thanh toán đủ tháng 2', NOW());

-- HK002: 4 members, paid Jan with discount (4 * 6000 * 0.8 = 19,200)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(2, 1, 19200.00, '2025-01-20', '1', 4, 'Đã giảm 20% (có người cao tuổi)', NOW());

-- HK003: 3 members, paid Jan with discount (3 * 6000 * 0.8 = 14,400)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(3, 1, 14400.00, '2025-01-22', '1', 4, 'Đã giảm 20% (có sinh viên)', NOW()),
(3, 2, 14400.00, '2025-02-20', '2', 5, 'Đã giảm 20% (có sinh viên)', NOW());

-- HK004: 5 members, paid Jan-Feb with discount (5 * 6000 * 0.8 = 24,000)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(4, 1, 24000.00, '2025-01-25', '1', 5, 'Đã giảm 20% (có người cao tuổi và sinh viên)', NOW()),
(4, 2, 24000.00, '2025-02-22', '2', 5, 'Đã giảm 20% (có người cao tuổi và sinh viên)', NOW());

-- HK005: 7 members, paid Jan-Feb with discount (7 * 6000 * 0.8 = 33,600)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(5, 1, 33600.00, '2025-01-28', '1', 5, 'Đã giảm 20% (có người cao tuổi và học sinh)', NOW()),
(5, 2, 33600.00, '2025-02-25', '2', 4, 'Đã giảm 20% (có người cao tuổi và học sinh)', NOW());

-- HK006: 1 member, paid Jan-Feb (no discount)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(6, 1, 6000.00, '2025-01-30', '1', 4, 'Đã thanh toán đủ tháng 1', NOW()),
(6, 2, 6000.00, '2025-02-28', '2', 4, 'Đã thanh toán đủ tháng 2', NOW());

-- HK007: 2 members, paid Jan only (unpaid Feb)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(7, 1, 12000.00, '2025-01-18', '1', 5, 'Đã thanh toán đủ tháng 1', NOW());

-- HK008: 4 members, not paid yet (new household)
-- (No payment records for HK008 - will be used for testing unpaid households)

-- Management fee payments (Q1 2025)
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(1, 4, 150000.00, '2025-01-15', '1,2,3', 4, 'Phí quản lý Q1 - 3 tháng', NOW()),
(2, 4, 150000.00, '2025-01-20', '1,2,3', 4, 'Phí quản lý Q1 - 3 tháng', NOW()),
(3, 4, 150000.00, '2025-01-22', '1,2,3', 4, 'Phí quản lý Q1 - 3 tháng', NOW());

-- Voluntary contribution
INSERT INTO thu_phi_ho_khau (ho_khau_id, dot_thu_phi_id, so_tien_da_thu, ngay_thu, months, collected_by, ghi_chu, created_at) VALUES
(1, 6, 200000.00, '2025-01-15', '', 4, 'Đóng góp tự nguyện', NOW()),
(2, 6, 150000.00, '2025-01-20', '', 4, 'Đóng góp tự nguyện', NOW()),
(4, 6, 300000.00, '2025-01-25', '', 5, 'Đóng góp tự nguyện', NOW());

-- ============================================================================
-- 6. BIEN_DONG (Population Changes)
-- Column names: nhan_khau_id, loai, noi_dung, thoi_gian, ho_khau_id, created_by, created_at
-- ============================================================================

INSERT INTO bien_dong (nhan_khau_id, loai, noi_dung, thoi_gian, ho_khau_id, created_by, created_at) VALUES
-- Birth
(17, 'SINH', 'Con gái sinh ngày 25/09/2024', '2024-09-25 10:00:00', 5, 2, NOW()),

-- Death
(NULL, 'TU_VONG', 'Ông Nguyễn Văn Tuấn (HK002) qua đời ngày 15/06/2024', '2024-06-15 14:30:00', 2, 2, NOW()),

-- Move in
(22, 'CHUYEN_DEN', 'Chuyển đến từ Quận 7 ngày 01/10/2024', '2024-10-01 09:00:00', 6, 2, NOW()),

-- Temporarily absent
(7, 'TAM_VANG', 'Đi công tác dài hạn 6 tháng từ ngày 10/01/2025', '2025-01-10 08:00:00', 2, 3, NOW());

-- ============================================================================
-- Data Summary
-- ============================================================================
-- Total Accounts: 5 (1 admin, 2 leaders, 2 collectors)
-- Total Households: 8
-- Total Citizens: 30
-- Total Fee Periods: 6 (3 monthly, 2 quarterly, 1 contribution)
-- Total Payments: 19
-- Total Changes: 4
-- ============================================================================

-- Verification queries
SELECT 'tai_khoan' AS table_name, COUNT(*) AS count FROM tai_khoan
UNION ALL
SELECT 'ho_khau', COUNT(*) FROM ho_khau
UNION ALL
SELECT 'nhan_khau', COUNT(*) FROM nhan_khau
UNION ALL
SELECT 'dot_thu_phi', COUNT(*) FROM dot_thu_phi
UNION ALL
SELECT 'thu_phi_ho_khau', COUNT(*) FROM thu_phi_ho_khau
UNION ALL
SELECT 'bien_dong', COUNT(*) FROM bien_dong;
