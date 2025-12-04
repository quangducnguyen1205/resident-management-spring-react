-- ============================================================================
--  QuanLyDanCu seed data (fully aligned with backend logic - December 2025)
--  Usage:
--     psql -h <host> -U postgres -d quanlydancu -f test-seed.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- RESET TABLES (ĐÚNG THỨ TỰ FK)
-- ---------------------------------------------------------------------------
TRUNCATE TABLE thu_phi_ho_khau RESTART IDENTITY CASCADE;
TRUNCATE TABLE bien_dong RESTART IDENTITY CASCADE;
TRUNCATE TABLE dot_thu_phi RESTART IDENTITY CASCADE;
TRUNCATE TABLE nhan_khau RESTART IDENTITY CASCADE;
TRUNCATE TABLE ho_khau RESTART IDENTITY CASCADE;
TRUNCATE TABLE tai_khoan RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- TÀI KHOẢN (5 TÀI KHOẢN GIỐNG HỆ THỐNG TEST)
-- Password: "admin123"
--   bcrypt: $2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO
-- ---------------------------------------------------------------------------
INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, ho_ten, email, ngay_tao, trang_thai) VALUES
('admin',      '$2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO', 'ADMIN',   'Nguyễn Quản Trị', 'admin@ql.com',     NOW(), 'ACTIVE'),
('totruong01', '$2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO', 'TOTRUONG','Trần Văn Tổ',      'totruong01@ql.com',NOW(), 'ACTIVE'),
('totruong02', '$2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO', 'TOTRUONG','Lê Thị Lan',       'totruong02@ql.com',NOW(), 'ACTIVE'),
('ketoan01',   '$2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO', 'KETOAN',  'Phạm Văn Toán',    'ketoan01@ql.com', NOW(), 'ACTIVE'),
('ketoan02',   '$2a$10$WANbEy0NfxVIFGJUn2RYIOe1grhQOqMPmqE.96SrePqg5RhITH4xO', 'KETOAN',  'Hoàng Thị Hoa',    'ketoan02@ql.com', NOW(), 'ACTIVE');

-- ---------------------------------------------------------------------------
-- HỘ KHẨU (8 HỘ)
-- ---------------------------------------------------------------------------
INSERT INTO ho_khau (so_ho_khau, ten_chu_ho, dia_chi, ngay_tao) VALUES
('HK001', 'Nguyễn Văn An',   '123 Nguyễn Huệ, Q1, TP.HCM',                   '2024-01-15'),
('HK002', 'Trần Văn Bình',   '45 Lê Lợi, Q3, TP.HCM',                        '2024-02-02'),
('HK003', 'Lê Thị Cúc',      '17 Trần Hưng Đạo, Q5, TP.HCM',                 '2024-02-20'),
('HK004', 'Phạm Văn Dũng',   '89 Phan Đình Phùng, Q.Phú Nhuận, TP.HCM',      '2024-03-05'),
('HK005', 'Hoàng Văn Em',    '56 Võ Văn Tần, Q3, TP.HCM',                    '2024-03-22'),
('HK006', 'Võ Thị Phượng',   '212 Cách Mạng Tháng Tám, Q10, TP.HCM',         '2024-04-10'),
('HK007', 'Đỗ Văn Giang',    '38 Hai Bà Trưng, Q1, TP.HCM',                  '2024-05-01'),
('HK008', 'Bùi Thị Hương',   '72 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',       '2024-05-18');

-- ---------------------------------------------------------------------------
-- NHÂN KHẨU (~30 NGƯỜI)
-- ---------------------------------------------------------------------------
INSERT INTO nhan_khau (
    ho_ten, ngay_sinh, gioi_tinh, dan_toc, quoc_tich, nghe_nghiep,
    cmnd_cccd, ngay_cap, noi_cap,
    quan_he_chu_ho, ghi_chu,
    tam_vang_tu, tam_vang_den, tam_tru_tu, tam_tru_den,
    ho_khau_id
) VALUES
-- HK001 (4)
('Nguyễn Văn An',      '1985-05-10', 'Nam', 'Kinh', 'Việt Nam', 'Kỹ sư phần mềm','001085001234', '2010-02-12', 'Công an TP.HCM', 'Chủ hộ', NULL, NULL,NULL,NULL,NULL,1),
('Trần Thị Bích',      '1988-08-15', 'Nữ',  'Kinh', 'Việt Nam', 'Giáo viên',     '001088002345', '2012-06-05', 'Công an TP.HCM', 'Vợ',     NULL, NULL,NULL,NULL,NULL,1),
('Nguyễn Văn Cường',   '2013-03-20', 'Nam', 'Kinh', 'Việt Nam', 'Học sinh',      NULL, NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,1),
('Nguyễn Ngọc Lan',    '2018-11-02', 'Nữ',  'Kinh', 'Việt Nam', 'Học sinh',      NULL, NULL,NULL,'Con','Yêu thích hội họa',NULL,NULL,NULL,NULL,1),

-- HK002 (4)
('Trần Văn Bình',      '1955-12-05', 'Nam', 'Kinh', 'Việt Nam', 'Về hưu',        '001055003456','2008-05-22','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,2),
('Lê Thị Dung',        '1958-06-10', 'Nữ',  'Kinh', 'Việt Nam', 'Nội trợ',       '001058004567','2011-04-18','Công an TP.HCM','Vợ',NULL,NULL,NULL,NULL,NULL,2),
('Trần Văn Em',        '1990-09-15', 'Nam', 'Kinh', 'Việt Nam', 'Kỹ thuật viên', '001090005678','2015-03-12','Công an TP.HCM','Con',NULL,'2025-10-01','2026-01-31',NULL,NULL,2),
('Nguyễn Thị Phương',  '1992-02-20', 'Nữ',  'Kinh', 'Việt Nam', 'Y tá',          '001092006789','2016-07-01','Công an TP.HCM','Con dâu',NULL,NULL,NULL,'2025-05-01','2025-12-31',2),

-- HK003 (4)
('Lê Thị Cúc',         '1975-04-12', 'Nữ', 'Kinh','Việt Nam','Công nhân','001075007890','2013-01-08','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,3),
('Nguyễn Văn Thanh',   '1973-09-28', 'Nam','Kinh','Việt Nam','Tài xế','001073008901','2013-03-11','Công an TP.HCM','Chồng',NULL,NULL,NULL,NULL,NULL,3),
('Lê Văn Phúc',        '2002-07-18','Nam','Kinh','Việt Nam','Sinh viên','001002009012','2020-08-20','Công an TP.HCM','Con','Thực tập','2025-05-10','2025-08-30',NULL,NULL,3),
('Lê Thị Quỳnh',       '2007-11-25','Nữ','Kinh','Việt Nam','Học sinh',NULL,NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,3),

-- HK004 (4)
('Phạm Văn Dũng',      '1970-08-22','Nam','Kinh','Việt Nam','Kinh doanh','001070009123','2012-12-15','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,4),
('Hoàng Thị Giang',    '1972-11-30','Nữ','Kinh','Việt Nam','Kế toán','001072010234','2014-05-03','Công an TP.HCM','Vợ',NULL,NULL,NULL,NULL,NULL,4),
('Phạm Thị Hoa',       '1948-03-05','Nữ','Kinh','Việt Nam','Về hưu','001048011345','2005-02-01','Công an Hà Nội','Mẹ','Thường xuyên khám định kỳ',NULL,NULL,NULL,NULL,4),
('Phạm Văn Hùng',      '2002-06-12','Nam','Kinh','Việt Nam','Sinh viên','001002012456','2020-09-14','Công an TP.HCM','Con',NULL,NULL,NULL,NULL,NULL,4),

-- HK005 (4)
('Hoàng Văn Em',       '1980-01-10','Nam','Kinh','Việt Nam','Thợ xây','001080013567','2011-01-19','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,5),
('Trần Thị Khánh',     '1982-05-15','Nữ','Kinh','Việt Nam','Buôn bán nhỏ','001082014678','2012-10-07','Công an TP.HCM','Vợ',NULL,NULL,NULL,NULL,NULL,5),
('Hoàng Văn Long',     '2006-08-20','Nam','Kinh','Việt Nam','Học sinh','001006015789','2022-09-05','Công an TP.HCM','Con',NULL,'2025-01-05','2025-04-30',NULL,NULL,5),
('Hoàng Thị Mai',      '2010-11-25','Nữ','Kinh','Việt Nam','Học sinh',NULL,NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,5),

-- HK006 (3)
('Võ Thị Phượng',      '1992-04-18','Nữ','Kinh','Việt Nam','NV văn phòng','001092016890','2018-03-19','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,6),
('Nguyễn Hoàng Tuấn',  '1994-12-01','Nam','Kinh','Việt Nam','Kỹ sư xây dựng','001094017901','2019-05-08','Công an Đồng Nai','Anh trai',NULL,NULL,NULL,'2025-03-01',NULL,6),
('Võ Gia Chi',         '2020-07-14','Nữ','Kinh','Việt Nam','Trẻ em',NULL,NULL,NULL,'Con','Thích truyện tranh',NULL,NULL,NULL,NULL,6),

-- HK007 (3)
('Đỗ Văn Giang',       '1987-07-22','Nam','Kinh','Việt Nam','Lái xe tải','001087018912','2014-11-20','Công an TP.HCM','Chủ hộ',NULL,'2025-11-01','2026-02-01',NULL,NULL,7),
('Nguyễn Thị Hiền',    '1989-10-30','Nữ','Kinh','Việt Nam','Điều dưỡng','001089019123','2015-09-10','Công an TP.HCM','Vợ',NULL,NULL,NULL,NULL,NULL,7),
('Đỗ Trần Khoa',       '2014-04-08','Nam','Kinh','Việt Nam','Học sinh',NULL,NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,7),

-- HK008 (4)
('Bùi Thị Hương',      '1986-12-08','Nữ','Kinh','Việt Nam','Dược sĩ','001086020134','2010-09-09','Công an TP.HCM','Chủ hộ',NULL,NULL,NULL,NULL,NULL,8),
('Phan Văn Kiên',      '1984-03-15','Nam','Kinh','Việt Nam','Lập trình viên','001084021245','2011-06-18','Công an Hà Nội','Chồng',NULL,'2025-09-15','2025-12-30',NULL,NULL,8),
('Bùi Văn Long',       '2010-06-20','Nam','Kinh','Việt Nam','Học sinh',NULL,NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,8),
('Bùi Thị Mai',        '2015-09-25','Nữ','Kinh','Việt Nam','Học sinh',NULL,NULL,NULL,'Con',NULL,NULL,NULL,NULL,NULL,8);

-- ---------------------------------------------------------------------------
-- ĐỢT THU PHÍ (6)
-- 4 đợt tháng nhỏ, 2 đợt quý, 1 đợt tự nguyện cả năm
-- ---------------------------------------------------------------------------
INSERT INTO dot_thu_phi (ten_dot, loai, ngay_bat_dau, ngay_ket_thuc, dinh_muc) VALUES
('Phí vệ sinh tháng 1/2025', 'BAT_BUOC', '2025-01-01', '2025-01-31', 6000.00),
('Phí vệ sinh tháng 2/2025', 'BAT_BUOC', '2025-02-01', '2025-02-28', 6000.00),
('Phí vệ sinh tháng 3/2025', 'BAT_BUOC', '2025-03-01', '2025-03-31', 6000.00),
('Phí quản lý Q1/2025',      'BAT_BUOC', '2025-01-01', '2025-03-31', 50000.00),
('Phí quản lý Q2/2025',      'BAT_BUOC', '2025-04-01', '2025-06-30', 50000.00),
('Đóng góp xây nhà văn hóa', 'TU_NGUYEN','2025-01-01', '2025-12-31',100000.00);

-- ---------------------------------------------------------------------------
-- Thu phí hộ khẩu & biến động: để TRỐNG cho test tạo mới
-- ---------------------------------------------------------------------------

-- END OF SEED