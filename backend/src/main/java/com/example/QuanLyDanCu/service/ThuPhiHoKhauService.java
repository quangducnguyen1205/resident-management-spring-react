package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.ThuPhiHoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.ThuPhiHoKhauResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.ThuPhiHoKhau;
import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
import com.example.QuanLyDanCu.exception.BadRequestException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.DotThuPhiRepository;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.repository.ThuPhiHoKhauRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service quản lý thu phí hộ khẩu - SIMPLIFIED VERSION (2025)
 * 
 * <h2>Quy tắc mới:</h2>
 * <ul>
 *   <li><b>Một bản ghi duy nhất</b> cho mỗi hộ khẩu + đợt thu phí</li>
 *   <li><b>Thanh toán toàn bộ</b> một lần (không hỗ trợ thanh toán từng phần)</li>
 *   <li><b>Tính tháng động</b> từ ngayBatDau/ngayKetThuc của đợt thu phí</li>
 *   <li><b>Công thức bắt buộc:</b> tongPhi = soNguoi × dinhMuc × sốTháng (bao gồm cả hai đầu mút)</li>
 *   <li><b>Phi tự nguyện:</b> tongPhi được lấy trực tiếp từ yêu cầu người dùng</li>
 *   <li><b>Lưu trữ:</b> bảng `thu_phi_ho_khau` chỉ lưu trạng thái `DA_NOP`; `CHUA_NOP` chỉ dùng khi hiển thị tổng quan</li>
 * </ul>
 * 
 * <h3>Trạng thái:</h3>
 * <ul>
 *   <li><b>BAT_BUOC:</b> DA_NOP (đã nộp đủ một lần), CHUA_NOP (ngầm hiểu khi chưa có bản ghi)</li>
 *   <li><b>TU_NGUYEN:</b> chỉ tạo bản ghi khi người dân đóng góp</li>
 * </ul>
 * 
 * @author Refactored November 2025
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ThuPhiHoKhauService {

    private final ThuPhiHoKhauRepository repo;
    private final HoKhauRepository hoKhauRepo;
    private final DotThuPhiRepository dotThuPhiRepo;
    private final TaiKhoanRepository taiKhoanRepo;
    private final NhanKhauRepository nhanKhauRepo;

    // ========================================
    // PUBLIC API METHODS
    // ========================================

    /**
     * Lấy tất cả bản ghi thu phí, sắp xếp ổn định theo soHoKhau
     */
    public List<ThuPhiHoKhauResponseDto> getAll() {
        return repo.findAll().stream()
                .sorted((t1, t2) -> {
                    String so1 = t1.getHoKhau().getSoHoKhau();
                    String so2 = t2.getHoKhau().getSoHoKhau();
                    if (so1 == null) return 1;
                    if (so2 == null) return -1;
                    return so1.compareTo(so2);
                })
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả bản ghi thu phí của một hộ khẩu
     */
    public List<ThuPhiHoKhauResponseDto> findByHoKhauId(Long hoKhauId) {
        return repo.findByHoKhauId(hoKhauId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả bản ghi thu phí của một đợt thu phí
     */
    public List<ThuPhiHoKhauResponseDto> findByDotThuPhiId(Long dotThuPhiId) {
        return repo.findByDotThuPhiId(dotThuPhiId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Tổng quan thu phí theo đợt – trả về cấu trúc thống kê cuối cùng.
     */
    public Map<String, Object> getOverviewByPeriod(Long dotThuPhiId) {
        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dotThuPhiId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy đợt thu phí với ID = " + dotThuPhiId));

        if (dotThuPhi.getLoai() == LoaiThuPhi.BAT_BUOC) {
            return buildMandatoryOverview(dotThuPhi);
        }

        return buildVoluntaryOverview(dotThuPhi);
    }

    private Map<String, Object> buildMandatoryOverview(DotThuPhi dotThuPhi) {
        long soThang = calculateMonths(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());

        Map<Long, ThuPhiHoKhau> recordsByHousehold = repo.findByDotThuPhiId(dotThuPhi.getId()).stream()
                .collect(Collectors.toMap(
                        record -> record.getHoKhau().getId(),
                        record -> record,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<HoKhau> households = hoKhauRepo.findAllByOrderByIdAsc();
        households.sort(Comparator.comparing(
            HoKhau::getSoHoKhau,
            Comparator.nullsLast(String::compareTo)));
        List<ThuPhiHoKhauResponseDto> rows = new ArrayList<>();

        int totalHouseholds = households.size();
        int paidHouseholds = recordsByHousehold.size();
        BigDecimal tongDuKien = BigDecimal.ZERO;
        BigDecimal tongDaThu = BigDecimal.ZERO;

        for (HoKhau hoKhau : households) {
            int soNguoi = countEligibleMembers(hoKhau.getId());
            BigDecimal expected = calculateMandatoryAmount(soNguoi, dotThuPhi.getDinhMuc(), soThang);
            ThuPhiHoKhau existing = recordsByHousehold.get(hoKhau.getId());

            ThuPhiHoKhauResponseDto dto;
            TrangThaiThuPhi trangThai;
            BigDecimal recordedAmount;

            if (existing != null) {
                dto = toResponseDto(existing);
                trangThai = existing.getTrangThai();
                recordedAmount = existing.getTongPhi();
                soNguoi = existing.getSoNguoi() != null ? existing.getSoNguoi() : soNguoi;
            } else {
                trangThai = TrangThaiThuPhi.CHUA_NOP;
                recordedAmount = expected;
                dto = ThuPhiHoKhauResponseDto.builder()
                        .id(null)
                        .hoKhauId(hoKhau.getId())
                        .soHoKhau(hoKhau.getSoHoKhau())
                        .tenChuHo(hoKhau.getTenChuHo())
                        .dotThuPhiId(dotThuPhi.getId())
                        .tenDot(dotThuPhi.getTenDot())
                        .loaiThuPhi(dotThuPhi.getLoai())
                        .soNguoi(soNguoi)
                        .soThang(soThang)
                        .tongPhi(expected)
                        .trangThai(trangThai)
                        .ngayThu(null)
                        .ghiChu(null)
                        .build();
            }

            tongDuKien = tongDuKien.add(expected);

            if (existing != null) {
                tongDaThu = tongDaThu.add(recordedAmount == null ? BigDecimal.ZERO : recordedAmount);
            }

            rows.add(dto);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("dotThuPhiId", dotThuPhi.getId());
        summary.put("tenDot", dotThuPhi.getTenDot());
        summary.put("loai", dotThuPhi.getLoai());
        summary.put("tongHo", totalHouseholds);
        summary.put("soHoDaNop", paidHouseholds);
        summary.put("soHoChuaNop", Math.max(totalHouseholds - paidHouseholds, 0));
        summary.put("tongDuKien", tongDuKien);
        summary.put("soThang", soThang);
        summary.put("tongDaThu", tongDaThu);
        summary.put("tiLeHoDaNop", calculatePercentage(paidHouseholds, totalHouseholds));
        summary.put("tiLeTienDaThu", calculateRatio(tongDaThu, tongDuKien));
        summary.put("households", rows);

        return summary;
    }

    private Map<String, Object> buildVoluntaryOverview(DotThuPhi dotThuPhi) {
        List<ThuPhiHoKhauResponseDto> households = repo.findByDotThuPhiId(dotThuPhi.getId()).stream()
            .sorted(Comparator.comparing(
                (ThuPhiHoKhau record) -> {
                    HoKhau hoKhau = record.getHoKhau();
                    return hoKhau == null ? null : hoKhau.getSoHoKhau();
                },
                Comparator.nullsLast(String::compareTo)))
                .map(this::toResponseDto)
                .collect(Collectors.toList());

        BigDecimal total = households.stream()
                .map(dto -> dto.getTongPhi() == null ? BigDecimal.ZERO : dto.getTongPhi())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("dotThuPhiId", dotThuPhi.getId());
        summary.put("tenDot", dotThuPhi.getTenDot());
        summary.put("loai", dotThuPhi.getLoai());
        summary.put("tongTienTuNguyen", total);
        summary.put("households", households);
        return summary;
    }

    /**
     * Tính toán phí cho hộ khẩu theo đợt thu phí
     * 
     * @return Map chứa thông tin chi tiết về tính phí
     */
    public Map<String, Object> calculateFee(Long hoKhauId, Long dotThuPhiId) {
        HoKhau hoKhau = hoKhauRepo.findById(hoKhauId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu với ID = " + hoKhauId));

        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dotThuPhiId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy đợt thu phí với ID = " + dotThuPhiId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hoKhauId", hoKhauId);
        result.put("soHoKhau", hoKhau.getSoHoKhau());
        result.put("tenChuHo", hoKhau.getTenChuHo());
        result.put("dotThuPhiId", dotThuPhiId);
        result.put("tenDot", dotThuPhi.getTenDot());
        result.put("loaiThuPhi", dotThuPhi.getLoai());

        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            result.put("message", "Đợt thu tự nguyện không có định mức cố định. Người dân tự quyết định số tiền đóng góp.");
            result.put("suggestedAmount", dotThuPhi.getDinhMuc());
            return result;
        }

        int memberCount = countEligibleMembers(hoKhauId);
        BigDecimal dinhMuc = dotThuPhi.getDinhMuc();
        long soThang = calculateMonths(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());
        BigDecimal totalFee = calculateMandatoryAmount(memberCount, dinhMuc, soThang);

        result.put("memberCount", memberCount);
        result.put("soThang", soThang);
        result.put("dinhMuc", dinhMuc);
        result.put("totalFee", totalFee);
        result.put("formula", String.format("%s × %d × %d = %s VND", dinhMuc, memberCount, soThang, totalFee));

        return result;
        }

    /**
     * Tạo bản ghi thu phí mới (ghi nhận thanh toán)
     * 
     * QUY TẮC:
     * - Chỉ cho phép một bản ghi duy nhất cho mỗi hộ khẩu + đợt thu phí
     * - Thanh toán luôn là toàn bộ số tiền (không hỗ trợ thanh toán từng phần)
    * - BAT_BUOC: trạng thái = DA_NOP (do ghi nhận thanh toán đầy đủ)
    * - TU_NGUYEN: ghi nhận số tiền người dân đóng góp
     */
    @Transactional
    public ThuPhiHoKhauResponseDto create(ThuPhiHoKhauRequestDto dto, Authentication auth) {
        
        // Validate household exists
        HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu với ID = " + dto.getHoKhauId()));
        
        // Validate fee period exists
        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy đợt thu phí với ID = " + dto.getDotThuPhiId()));

        if (dotThuPhi.getLoai() == LoaiThuPhi.BAT_BUOC && dto.getTongPhi() != null) {
            throw new BadRequestException("Không được gửi trường 'tongPhi' cho đợt thu bắt buộc!");
        }
        
        // CRITICAL: Check if a record already exists (enforce one record per household + period)
        List<ThuPhiHoKhau> existingRecords = repo.findByHoKhauIdAndDotThuPhiId(
                dto.getHoKhauId(), dto.getDotThuPhiId());
        
        if (!existingRecords.isEmpty()) {
            throw new BadRequestException(String.format(
                    "Đã tồn tại bản ghi thu phí cho hộ khẩu '%s' trong đợt '%s'. " +
                    "Mỗi hộ khẩu chỉ được có một bản ghi cho mỗi đợt thu phí.",
                    hoKhau.getSoHoKhau(), dotThuPhi.getTenDot()));
        }
        
        // Validate payment date falls within a period
        validatePaymentDate(dto.getNgayThu(), dotThuPhi);
        
        // Get current user
        TaiKhoan currentUser = getCurrentUser(auth);
        
        // Calculate fee components
        int soNguoi;
        long soThang = dotThuPhi.getLoai() == LoaiThuPhi.BAT_BUOC
            ? calculateMonths(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc())
            : 0L;
        BigDecimal tongPhi;
        TrangThaiThuPhi trangThai = TrangThaiThuPhi.DA_NOP;

        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            soNguoi = 0;
            tongPhi = normalizeVoluntaryAmount(dto.getTongPhi());
        } else {
            soNguoi = countEligibleMembers(dto.getHoKhauId());
            tongPhi = calculateMandatoryAmount(soNguoi, dotThuPhi.getDinhMuc(), soThang);
        }
        
        // Create entity
        ThuPhiHoKhau entity = ThuPhiHoKhau.builder()
                .hoKhau(hoKhau)
                .dotThuPhi(dotThuPhi)
                .soNguoi(soNguoi)
                .tongPhi(tongPhi)
                .trangThai(trangThai)
                .ngayThu(dto.getNgayThu())
                .ghiChu(dto.getGhiChu())
                .build();
        
        ThuPhiHoKhau saved = repo.save(entity);
        
        log.info("Created fee record id={} hoKhau={} dotThuPhi={}", 
             saved.getId(), hoKhau.getId(), dotThuPhi.getId());
        
        return toResponseDto(saved);
    }

    /**
     * Xóa bản ghi thu phí
     */
    @Transactional
    public void delete(Long id, Authentication auth) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Không tìm thấy bản ghi thu phí với ID = " + id);
        }
        
        repo.deleteById(id);
        
        log.info("Deleted fee record id={}", id);
    }

    /**
     * Tính lại phí cho một hộ khẩu (khi số thành viên thay đổi)
     * 
     * CHỈ CẬP NHẬT:
     * - soNguoi
     * - tongPhi
     * 
     * KHÔNG CẬP NHẬT:
     * - trangThai (giữ nguyên)
     * - ngayThu
     * - ghiChu
     * - collectedBy
     */
    @Transactional
    public void recalculateForHousehold(Long hoKhauId) {
        if (hoKhauId == null) {
            return;
        }

        if (!hoKhauRepo.existsById(hoKhauId)) {
            return;
        }

        List<ThuPhiHoKhau> feeRecords = repo.findByHoKhauId(hoKhauId);
        if (feeRecords.isEmpty()) {
            return;
        }

        int activeMembers = countEligibleMembers(hoKhauId);

        List<ThuPhiHoKhau> toUpdate = new ArrayList<>();
        for (ThuPhiHoKhau record : feeRecords) {
            if (record.getDotThuPhi().getLoai() == LoaiThuPhi.TU_NGUYEN) {
                continue;
            }

            long soThang = calculateMonths(record.getDotThuPhi().getNgayBatDau(), record.getDotThuPhi().getNgayKetThuc());
            BigDecimal expected = calculateMandatoryAmount(activeMembers, record.getDotThuPhi().getDinhMuc(), soThang);
            if (!expected.equals(record.getTongPhi()) || !Integer.valueOf(activeMembers).equals(record.getSoNguoi())) {
                record.setSoNguoi(activeMembers);
                record.setTongPhi(expected);
                toUpdate.add(record);
            }
        }

        if (!toUpdate.isEmpty()) {
            repo.saveAll(toUpdate);
        }
    }


    /**
     * Thống kê thu phí
     */
    public Map<String, Object> getStats() {
        List<ThuPhiHoKhau> all = repo.findAll();
        
        long totalRecords = all.size();
        
        BigDecimal totalExpectedFee = all.stream()
                .map(t -> t.getTongPhi() != null ? t.getTongPhi() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long paidCount = all.stream()
                .filter(t -> t.getTrangThai() == TrangThaiThuPhi.DA_NOP)
                .count();
        
        long unpaidCount = 0L; // CHUA_NOP không còn được lưu trong cơ sở dữ liệu
        
        long totalHouseholds = all.stream()
                .map(t -> t.getHoKhau().getId())
                .distinct()
                .count();
        
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRecords", totalRecords);
        stats.put("totalExpectedFee", totalExpectedFee);
        stats.put("totalHouseholds", totalHouseholds);
        stats.put("paidRecords", paidCount);
        stats.put("unpaidRecords", unpaidCount);
        
        return stats;
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Chuẩn hóa và validate số tiền tự nguyện do người dùng nhập.
     */
    private BigDecimal normalizeVoluntaryAmount(BigDecimal rawAmount) {
        if (rawAmount == null) {
            throw new BadRequestException("Tổng phí tự nguyện phải lớn hơn 0!");
        }

        BigDecimal normalized = rawAmount.setScale(2, RoundingMode.HALF_UP);

        if (normalized.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Tổng phí tự nguyện phải lớn hơn 0!");
        }

        return normalized;
    }

    /**
     * Đếm số người đủ điều kiện trong hộ khẩu
     * 
     * LOẠI TRỪ:
     * - Người tạm vắng (tam_vang_den >= ngày hiện tại)
     * - Người đã khai tử (ngay_khai_tu != null)
     */
    private int countEligibleMembers(Long hoKhauId) {
        if (hoKhauId == null) {
            return 0;
        }
        long count = nhanKhauRepo.countActiveMembers(hoKhauId, LocalDate.now());
        return (int) count;
    }

    private BigDecimal calculateMandatoryAmount(int numberOfPeople, BigDecimal dinhMuc, long soThang) {
        if (dinhMuc == null || numberOfPeople <= 0 || soThang <= 0) {
            return BigDecimal.ZERO;
        }
        return dinhMuc
                .multiply(BigDecimal.valueOf(numberOfPeople))
                .multiply(BigDecimal.valueOf(soThang));
    }

    private long calculateMonths(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            return 1L;
        }
        YearMonth startMonth = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);
        long months = ChronoUnit.MONTHS.between(startMonth, endMonth) + 1;
        return Math.max(months, 1L);
    }

    private BigDecimal calculatePercentage(long numerator, long denominator) {
        if (denominator == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRatio(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal safeNumerator = numerator == null ? BigDecimal.ZERO : numerator;
        return safeNumerator.multiply(BigDecimal.valueOf(100))
                .divide(denominator, 2, RoundingMode.HALF_UP);
    }

    /**
     * Validate ngày thu phí phải nằm trong khoảng đợt thu phí
     */
    private void validatePaymentDate(LocalDate ngayThu, DotThuPhi dotThuPhi) {
        if (ngayThu == null) {
            throw new BadRequestException("Vui lòng nhập ngày thu!");
        }

        LocalDate ngayBatDau = dotThuPhi.getNgayBatDau();
        LocalDate ngayKetThuc = dotThuPhi.getNgayKetThuc();
        
        if (ngayBatDau != null && ngayThu.isBefore(ngayBatDau)) {
            throw new BadRequestException(String.format(
                    "Đợt thu phí '%s' chưa bắt đầu. Ngày thu phải từ %s trở đi.",
                    dotThuPhi.getTenDot(), ngayBatDau));
        }
        
        if (ngayKetThuc != null && ngayThu.isAfter(ngayKetThuc)) {
            throw new BadRequestException(String.format(
                    "Đợt thu phí '%s' đã kết thúc vào %s. Không thể ghi nhận thanh toán sau ngày này.",
                    dotThuPhi.getTenDot(), ngayKetThuc));
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     */
    private TaiKhoan getCurrentUser(Authentication auth) {
        return taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng hiện tại"));
    }

    /**
     * Chuyển đổi Entity -> Response DTO
     */
    private ThuPhiHoKhauResponseDto toResponseDto(ThuPhiHoKhau entity) {
        long soThang = calculateMonths(
            entity.getDotThuPhi().getNgayBatDau(),
            entity.getDotThuPhi().getNgayKetThuc());

        return ThuPhiHoKhauResponseDto.builder()
                .id(entity.getId())
                .hoKhauId(entity.getHoKhau().getId())
                .soHoKhau(entity.getHoKhau().getSoHoKhau())
                .tenChuHo(entity.getHoKhau().getTenChuHo())
                .dotThuPhiId(entity.getDotThuPhi().getId())
                .tenDot(entity.getDotThuPhi().getTenDot())
            .loaiThuPhi(entity.getDotThuPhi().getLoai())
                .soNguoi(entity.getSoNguoi())
            .soThang(soThang)
            .tongPhi(entity.getTongPhi())
                .trangThai(entity.getTrangThai())
                .ngayThu(entity.getNgayThu())
                .ghiChu(entity.getGhiChu())
                .build();
    }
}
