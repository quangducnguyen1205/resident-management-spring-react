# Quy tắc Nghiệp vụ Backend - Phiên bản 2
> QuanLyDanCu backend - Cập nhật tháng 11 năm 2025

## Mục lục
1. [Những thay đổi so với v1.0](#what-changed-since-v10)
2. [Ảnh chụp lược đồ CSDL](#1-database-schema-snapshot)
3. [Quy tắc quản lý hộ khẩu](#2-household-management-rules)
4. [Quy tắc quản lý nhân khẩu](#3-citizen-management-rules)
5. [Tạm trú & tạm vắng](#4-temporary-residence--absence)
6. [Quy tắc thu phí](#5-fee-management-rules)
7. [Ghi nhật ký biến động](#6-biến-động-logging)
8. [Bảo mật & bảo vệ dữ liệu](#7-security--data-protections)

---

## Những thay đổi so với v1.0
<a name="what-changed-since-v10"></a>
| Khu vực | Hành vi v1.0 | v2.0 (hiện tại) |
|------|----------------|----------------|
| Trường lược đồ | Các bảng lưu `created_by`, `updated_at`, `so_tien_da_thu`, v.v. | Mọi cột audit đã bị loại bỏ; chỉ giữ lại các cột quan trọng cho nghiệp vụ. |
| Thanh toán phí | Cho phép nhiều khoản nộp từng phần trong một đợt thu. | Giờ chỉ có **một** bản ghi cho mỗi `(hoKhauId, dotThuPhiId)` thể hiện khoản thanh toán đầy đủ. |
| Công thức phí | Cố định 12 tháng. | `tongPhi = dinh_muc x months_between_period x eligible_member_count`. |
| Phí tự nguyện | Có thể chứa tổng tùy ý. | Luôn cưỡng chế `soNguoi = 0`, `tongPhi = 0`, `trangThai = KHONG_AP_DUNG`. |
| Đếm nhân khẩu | Tính mọi nhân khẩu trong hộ. | Loại thành viên có `tamVangDen >= today` tại thời điểm tính toán. |
| Biến động | Đôi khi kích hoạt cập nhật dây chuyền. | Chỉ là nhật ký văn bản thuần; không bao giờ chỉnh sửa hộ hay nhân khẩu. |
| Tài liệu | Lẫn lộn thuật ngữ cũ. | Được viết lại hoàn toàn để phản ánh miền v2 đã đơn giản hóa. |

---

## 1. Ảnh chụp lược đồ CSDL
<a name="1-database-schema-snapshot"></a>
### 1.1 Các bảng tổng quan
| Bảng | Mục đích | Cột chính |
|-------|---------|-------------|
| `tai_khoan` | Người dùng hệ thống phục vụ xác thực và thu phí. | `id`, `ten_dang_nhap` (duy nhất), `mat_khau` (BCrypt), `vai_tro` (`ADMIN`, `TOTRUONG`, `KETOAN`), `ho_ten`, `email`, `ngay_tao`, `trang_thai`. |
| `ho_khau` | Hộ khẩu. | `id`, `so_ho_khau` bất biến, `ten_chu_ho`, `dia_chi`, `ngay_tao`. |
| `nhan_khau` | Nhân khẩu gắn với hộ. | `id`, `ho_ten`, `ngay_sinh`, `gioi_tinh`, `dan_toc`, `quoc_tich`, `nghe_nghiep`, bộ CCCD (`cmnd_cccd`, `ngay_cap`, `noi_cap`), `quan_he_chu_ho`, ghi chú, khoảng tạm trú/vắng, `ho_khau_id`. |
| `bien_dong` | Nhật ký biến động dạng văn bản thuần. | `id`, `loai` viết hoa, `noi_dung` (<=1000 ký tự), `thoi_gian`, tùy chọn `ho_khau_id`, `nhan_khau_id`. |
| `dot_thu_phi` | Đợt thu phí. | `id`, `ten_dot`, `loai` (`BAT_BUOC` hoặc `TU_NGUYEN`), `ngay_bat_dau`, `ngay_ket_thuc`, `dinh_muc` (`DECIMAL(15,2)`). |
| `thu_phi_ho_khau` | Phiếu thu theo hộ và đợt. | `id`, FK `ho_khau_id`, FK `dot_thu_phi_id`, `so_nguoi` tự tính, `tong_phi` tự tính, enum `trang_thai` (`CHUA_NOP`, `DA_NOP`, `KHONG_AP_DUNG`), tùy chọn `ngay_thu`, `ghi_chu`, `collected_by`. |

> **Không còn cột audit.** Mọi thứ liệt kê ở trên khớp 1:1 với các entity trong `backend/src/main/java/com/example/QuanLyDanCu/entity`.

### 1.2 Dữ liệu seed & hàng rào hồi quy
- `backend/test/seed-data/test-seed.sql` dọn sạch mọi bảng, chèn **5** tài khoản (1 admin, 2 tổ trưởng, 2 kế toán), **8** hộ khẩu, **30** nhân khẩu, **6** đợt thu phí và cố ý để trống `thu_phi_ho_khau`/`bien_dong` để test luôn có trạng thái sạch.
- `backend/test/case-study-api-test.sh` là script E2E duy nhất. Script đăng nhập bằng mọi vai trò, gọi tất cả controller (auth, hộ khẩu, nhân khẩu, biến động, đợt thu phí, thu phí hộ khẩu, security) và kiểm chứng những quy tắc phía dưới.

---

## 2. Quy tắc quản lý hộ khẩu
<a name="2-household-management-rules"></a>
1. `soHoKhau` được cấp ngoài hệ thống (thường bởi cán bộ) và **không thể chỉnh sửa** sau khi tạo (`@Column(updatable = false)`).
2. Chỉ `ADMIN` hoặc `TOTRUONG` mới được tạo/cập nhật/xóa hộ; `KETOAN` chỉ xem.
3. Khi tạo sẽ tự gán `ngayTao = LocalDate.now()` và phát `HoKhauChangedEvent` để chuẩn bị stub thu phí.
4. Cập nhật là **partial update** chỉ nhận `tenChuHo` hoặc `diaChi`. Nếu không có thay đổi, service trả lại "Không có gì để thay đổi!".
5. Xóa hộ phát sự kiện để xóa dây chuyền các phiếu thu thuộc hộ đó. Nhân khẩu phải được chuyển hoặc xóa thủ công trước.

---

## 3. Quy tắc quản lý nhân khẩu
<a name="3-citizen-management-rules"></a>
1. Trường bắt buộc: `hoTen`, `ngaySinh` (<= hôm nay), `gioiTinh`, `hoKhauId`. Thông tin văn hóa (dân tộc/quốc tịch) là tự do.
2. **Kiểm tra CCCD theo tuổi** (`NhanKhauService#validateCccdByAge`):
   - `< 14` tuổi: toàn bộ trường CCCD **phải null/rỗng**.
   - `>= 14` tuổi: bắt buộc `cmndCccd`, `ngayCap`, `noiCap`, số phải 9-12 chữ số, `ngayCap >= ngaySinh + 14 năm` và `<= hôm nay`.
3. Mọi thao tác (tạo/cập nhật/xóa hoặc thay đổi tạm trú/vắng) đều phát `NhanKhauChangedEvent` để hộ khẩu tự tính lại phí.
4. Partial update cho phép thay đổi bất kỳ trường nào nhưng luôn chạy lại kiểm tra CCCD sau khi trộn dữ liệu.
5. Xóa cứng, không có cờ soft delete.
6. Trạng thái dẫn xuất trong `NhanKhauResponseDto.trangThaiHienTai`:
   - `TAM_VANG` nếu hôm nay thuộc [`tamVangTu`, `tamVangDen`].
   - Ngược lại `TAM_TRU` nếu hôm nay thuộc [`tamTruTu`, `tamTruDen`].
   - Nếu không thì `THUONG_TRU`.

---

## 4. Tạm trú & tạm vắng
<a name="4-temporary-residence--absence"></a>
1. **Ràng buộc** (`DangKyTamTruTamVangRequestDto`):
   - `ngayBatDau` phải >= hôm nay; `ngayKetThuc` phải > hôm nay; `ngayBatDau < ngayKetThuc`; `lyDo` là bắt buộc cho cả API tạm trú lẫn tạm vắng.
2. **Tạm trú** chỉ cập nhật cặp `tamTruTu/tamTruDen` và ghi một dòng `bien_dong`. Không ảnh hưởng tính phí.
3. **Tạm vắng** cập nhật `tamVangTu/tamVangDen`, ghi biến động và kích hoạt tính lại phí vì thành viên vắng mặt không được tính vào `soNguoi` khi `tamVangDen` nằm trong tương lai (xem §5.2).
4. API hủy chỉ việc đặt lại cặp ngày tương ứng về null, thêm log, và (đối với tạm vắng) tính phí lại.

---

## 5. Quy tắc thu phí
<a name="5-fee-management-rules"></a>
### 5.1 Đợt thu phí (`dot_thu_phi`)
- Bắt buộc (`BAT_BUOC`): `dinhMuc` phải dương; ngày kết thúc phải >= ngày bắt đầu.
- Tự nguyện (`TU_NGUYEN`): `dinhMuc` mặc định 0 nếu bỏ trống.
- Số tháng được tính động: `months = ChronoUnit.MONTHS.between(ngayBatDau, ngayKetThuc)` và làm tròn lên khi có tháng lẻ, tối thiểu 1.

### 5.2 Phiếu thu (`thu_phi_ho_khau`)
| Quy tắc | Chi tiết |
|------|--------|
| Bản ghi đơn | Service từ chối tạo nếu đã có mục cùng `(hoKhauId, dotThuPhiId)`. |
| Tự tính tổng | `soNguoi` tính từ `nhan_khau` (loại ai có `tamVangDen` là hôm nay hoặc tương lai). `tongPhi = dinh_muc x months x soNguoi`. |
| Bộ trạng thái | Chỉ có `CHUA_NOP`, `DA_NOP`, `KHONG_AP_DUNG`. Phiếu bắt buộc tạo qua API dùng `DA_NOP`; phiếu tự nguyện luôn dùng `KHONG_AP_DUNG`. |
| Phí tự nguyện | Luôn cưỡng chế `soNguoi = 0`, `tongPhi = 0` bất kể quy mô hộ. |
| Ngày thu | Nếu cung cấp thì phải nằm trong khoảng đợt thu; nếu không sẽ bị từ chối. |
| Partial update | Chỉ sửa được `ngayThu` và `ghiChu`. Không cho đổi ID khóa ngoại. |
| Tính lại | Sự kiện hộ và nhân khẩu gọi `ThuPhiHoKhauService.recalculateForHousehold`, cập nhật `soNguoi` và `tongPhi` cho phiếu **bắt buộc** nhưng giữ nguyên trạng thái, ngày và collectedBy. |
| Stub ban đầu | Khi tạo hộ, đợt thu khả dụng đầu tiên sẽ sinh stub (`CHUA_NOP` nếu bắt buộc, `KHONG_AP_DUNG` nếu tự nguyện) để dashboard không bị trống. |

### 5.3 Trạng thái thu phí
| Trạng thái | Ý nghĩa | Khi nào sử dụng |
|--------|---------|-----------|
| `CHUA_NOP` | Phí bắt buộc đã tính nhưng chưa thu. | Chỉ áp dụng cho stub tự sinh trước khi ghi nhận tiền. |
| `DA_NOP` | Phí bắt buộc đã thu đủ theo số tháng và thành viên. | Mọi lần tạo phiếu thủ công thông qua API (sau khi đã thu tiền). |
| `KHONG_AP_DUNG` | Phí tự nguyện không thu tiền. | Toàn bộ đợt tự nguyện. |

---

## 6. Ghi nhật ký biến động
<a name="6-biến-động-logging"></a>
1. Controller chỉ chấp nhận các loại viết hoa cố định: `CHUYEN_DEN`, `CHUYEN_DI`, `TACH_HO`, `NHAP_HO`, `KHAI_TU`, `SINH`, `THAY_DOI_THONG_TIN`.
2. DTO kiểm tra payload bằng regex; service chuyển sang chữ hoa trước khi lưu.
3. **Không có tác dụng phụ**: tạo, sửa, xóa log không làm thay đổi `nhan_khau` hay `ho_khau`. Mọi side-effect nghiệp vụ được xử lý tại các service tương ứng thông qua event.
4. `thoiGian` mặc định là `now()` nếu bỏ trống; cán bộ có thể nhập lại để ghi nhận quá khứ.
5. Văn bản giới hạn 1000 ký tự để nhật ký gọn gàng.

---

## 7. Bảo mật & bảo vệ dữ liệu
<a name="7-security--data-protections"></a>
1. Bảo mật JWT stateless: mọi endpoint trừ `/api/auth/**` và tài sản Swagger đều yêu cầu Bearer token hợp lệ.
2. Bảo vệ ở cấp method (`@PreAuthorize`) áp dụng ma trận vai trò:
   - `ADMIN`: toàn quyền mọi controller.
   - `TOTRUONG`: quản lý hộ & nhân khẩu, đọc phần còn lại, không tạo phiếu thu.
   - `KETOAN`: đọc hầu hết, quản lý đợt thu phí và thu phí hộ khẩu.
3. `GlobalExceptionHandler` chuẩn hóa lỗi:
   - Lỗi validation → `400` kèm map field.
   - Lỗi parse enum → `400` kèm giá trị hợp lệ.
   - AccessDenied → `403`.
   - RuntimeException → `400`.
4. Mật khẩu được băm bằng BCrypt; JWT chứa username và role để kiểm tra quyền mà không phải truy vấn DB mỗi request.
5. Script hồi quy cùng seed SQL là nguồn chân lý cho mọi cập nhật tài liệu—nếu thay đổi không phản ánh trong hai tài liệu này, xem như doc đã lỗi thời.
