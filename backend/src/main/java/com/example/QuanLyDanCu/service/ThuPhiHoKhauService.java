package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.ThuPhiHoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.ThuPhiHoKhauResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.ThuPhiHoKhau;
import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
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
import java.time.LocalDate;
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
 *   <li><b>Công thức:</b> tongPhi = dinhMuc × months × soNguoi</li>
 * </ul>
 * 
 * <h3>Trạng thái:</h3>
 * <ul>
 *   <li><b>BAT_BUOC:</b> DA_NOP (đã nộp đủ một lần)</li>
 *   <li><b>TU_NGUYEN:</b> KHONG_AP_DUNG (không bắt buộc)</li>
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
     * Lấy bản ghi thu phí theo ID
     */
    public ThuPhiHoKhauResponseDto getById(Long id) {
        ThuPhiHoKhau entity = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi thu phí với ID = " + id));
        return toResponseDto(entity);
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
         * Tổng quan thu phí theo đợt – trả về tất cả hộ khẩu cùng trạng thái hiện tại.
         */
        public List<ThuPhiHoKhauResponseDto> getOverviewByPeriod(Long dotThuPhiId) {
        log.info("Building fee overview for dotThuPhiId={}", dotThuPhiId);

        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dotThuPhiId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí với ID = " + dotThuPhiId));

        Map<Long, ThuPhiHoKhau> existingRecords = repo.findByDotThuPhiId(dotThuPhiId).stream()
            .collect(Collectors.toMap(
                record -> record.getHoKhau().getId(),
                record -> record,
                (left, right) -> left,
                LinkedHashMap::new
            ));

        List<HoKhau> households = hoKhauRepo.findAll().stream()
            .sorted(Comparator.comparing(
                (HoKhau hk) -> hk.getSoHoKhau(),
                Comparator.nullsLast(String::compareTo)
            ))
            .collect(Collectors.toList());

        boolean isVoluntary = dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN;
        int months = isVoluntary ? 0 : calculateMonthsInPeriod(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());

        List<ThuPhiHoKhauResponseDto> overview = new ArrayList<>();

        for (HoKhau hoKhau : households) {
            ThuPhiHoKhau existing = existingRecords.get(hoKhau.getId());
            if (existing != null) {
            overview.add(toResponseDto(existing));
            continue;
            }

            int soNguoi = isVoluntary ? 0 : countEligibleMembers(hoKhau.getId());
            BigDecimal tongPhi = isVoluntary
                ? BigDecimal.ZERO
                : calculateTotalFee(soNguoi, dotThuPhi.getDinhMuc(), months);

            TrangThaiThuPhi trangThai = isVoluntary
                ? TrangThaiThuPhi.KHONG_AP_DUNG
                : TrangThaiThuPhi.CHUA_NOP;

            overview.add(ThuPhiHoKhauResponseDto.builder()
                .id(null)
                .hoKhauId(hoKhau.getId())
                .soHoKhau(hoKhau.getSoHoKhau())
                .tenChuHo(hoKhau.getTenChuHo())
                .dotThuPhiId(dotThuPhi.getId())
                .tenDot(dotThuPhi.getTenDot())
                .soNguoi(soNguoi)
                .tongPhi(tongPhi)
                .trangThai(trangThai)
                .ngayThu(null)
                .ghiChu(null)
                .collectedBy(null)
                .build());
        }

        return overview;
        }

    /**
     * Tính toán phí cho hộ khẩu theo đợt thu phí
     * 
     * @return Map chứa thông tin chi tiết về tính phí
     */
    public Map<String, Object> calculateFee(Long hoKhauId, Long dotThuPhiId) {
        log.info("Calculating fee for hoKhauId={}, dotThuPhiId={}", hoKhauId, dotThuPhiId);
        
        // Validate household exists
        HoKhau hoKhau = hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID = " + hoKhauId));
        
        // Validate fee period exists
        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dotThuPhiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí với ID = " + dotThuPhiId));
        
        // Count eligible members
        int memberCount = countEligibleMembers(hoKhauId);
        
        // Calculate months in period
        int months = calculateMonthsInPeriod(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());
        
        // Calculate total fee
        BigDecimal monthlyFee = dotThuPhi.getDinhMuc();
        BigDecimal totalFee = calculateTotalFee(memberCount, monthlyFee, months);
        
        // Build response
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hoKhauId", hoKhauId);
        result.put("soHoKhau", hoKhau.getSoHoKhau());
        result.put("tenChuHo", hoKhau.getTenChuHo());
        result.put("dotThuPhiId", dotThuPhiId);
        result.put("tenDot", dotThuPhi.getTenDot());
        result.put("memberCount", memberCount);
        result.put("monthlyFeePerPerson", monthlyFee);
        result.put("months", months);
        result.put("totalFee", totalFee);
        result.put("formula", String.format("%s × %d × %d = %s VND", 
                monthlyFee, months, memberCount, totalFee));
        result.put("periodStart", dotThuPhi.getNgayBatDau());
        result.put("periodEnd", dotThuPhi.getNgayKetThuc());
        
        log.info("Calculated fee: {} members × {} months × {} VND = {} VND", 
                 memberCount, months, monthlyFee, totalFee);
        
        return result;
    }

    /**
     * Tạo bản ghi thu phí mới (ghi nhận thanh toán)
     * 
     * QUY TẮC:
     * - Chỉ cho phép một bản ghi duy nhất cho mỗi hộ khẩu + đợt thu phí
     * - Thanh toán luôn là toàn bộ số tiền (không hỗ trợ thanh toán từng phần)
     * - BAT_BUOC: trạng thái = DA_NOP
     * - TU_NGUYEN: trạng thái = KHONG_AP_DUNG
     */
    @Transactional
    public ThuPhiHoKhauResponseDto create(ThuPhiHoKhauRequestDto dto, Authentication auth) {
        log.info("Creating payment record for hoKhauId={}, dotThuPhiId={}", 
                 dto.getHoKhauId(), dto.getDotThuPhiId());
        
        // Validate household exists
        HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID = " + dto.getHoKhauId()));
        
        // Validate fee period exists
        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí với ID = " + dto.getDotThuPhiId()));
        
        // CRITICAL: Check if record already exists (enforce one record per household + period)
        List<ThuPhiHoKhau> existingRecords = repo.findByHoKhauIdAndDotThuPhiId(
                dto.getHoKhauId(), dto.getDotThuPhiId());
        
        if (!existingRecords.isEmpty()) {
            throw new RuntimeException(String.format(
                    "Đã tồn tại bản ghi thu phí cho hộ khẩu '%s' trong đợt '%s'. " +
                    "Mỗi hộ khẩu chỉ được có một bản ghi cho mỗi đợt thu phí.",
                    hoKhau.getSoHoKhau(), dotThuPhi.getTenDot()));
        }
        
        // Validate payment date falls within period
        validatePaymentDate(dto.getNgayThu(), dotThuPhi);
        
        // Get current user
        TaiKhoan currentUser = getCurrentUser(auth);
        
        // Calculate fee components
        int soNguoi;
        BigDecimal tongPhi;
        TrangThaiThuPhi trangThai;
        
        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            // Voluntary fees - not applicable
            soNguoi = 0;
            tongPhi = BigDecimal.ZERO;
            trangThai = TrangThaiThuPhi.KHONG_AP_DUNG;
            log.info("Creating voluntary fee record - status: KHONG_AP_DUNG");
        } else {
            // Mandatory fees - calculate and mark as paid
            soNguoi = countEligibleMembers(dto.getHoKhauId());
            int months = calculateMonthsInPeriod(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());
            tongPhi = calculateTotalFee(soNguoi, dotThuPhi.getDinhMuc(), months);
            trangThai = TrangThaiThuPhi.DA_NOP; // Payment complete on creation
            log.info("Creating mandatory fee record: {} members × {} months = {} VND, status: DA_NOP", 
                     soNguoi, months, tongPhi);
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
                .collectedBy(currentUser.getId())
                .build();
        
        ThuPhiHoKhau saved = repo.save(entity);
        
        log.info("✅ Successfully created payment record ID={} for household '{}', period '{}', status: {}", 
                 saved.getId(), hoKhau.getSoHoKhau(), dotThuPhi.getTenDot(), trangThai);
        
        return toResponseDto(saved);
    }

    /**
     * Cập nhật bản ghi thu phí
     * 
     * CHỈ CHO PHÉP CẬP NHẬT:
     * - ngayThu
     * - ghiChu
     * 
     * KHÔNG CHO PHÉP THAY ĐỔI:
     * - hoKhauId
     * - dotThuPhiId
     * - soNguoi
     * - tongPhi
     * - trangThai
     */
    @Transactional
    public ThuPhiHoKhauResponseDto update(Long id, ThuPhiHoKhauRequestDto dto, Authentication auth) {
        log.info("Updating payment record ID={}", id);
        
        ThuPhiHoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi thu phí với ID = " + id));
        
        // Validate: Cannot change household or fee period
        if (dto.getHoKhauId() != null && !dto.getHoKhauId().equals(existing.getHoKhau().getId())) {
            throw new RuntimeException("Không thể thay đổi hộ khẩu sau khi đã tạo bản ghi!");
        }
        
        if (dto.getDotThuPhiId() != null && !dto.getDotThuPhiId().equals(existing.getDotThuPhi().getId())) {
            throw new RuntimeException("Không thể thay đổi đợt thu phí sau khi đã tạo bản ghi!");
        }
        
        // Update allowed fields only
        boolean changed = false;
        
        if (dto.getNgayThu() != null && !dto.getNgayThu().equals(existing.getNgayThu())) {
            validatePaymentDate(dto.getNgayThu(), existing.getDotThuPhi());
            existing.setNgayThu(dto.getNgayThu());
            changed = true;
            log.info("Updated ngayThu: {}", dto.getNgayThu());
        }
        
        if (dto.getGhiChu() != null && !dto.getGhiChu().equals(existing.getGhiChu())) {
            existing.setGhiChu(dto.getGhiChu());
            changed = true;
            log.info("Updated ghiChu: {}", dto.getGhiChu());
        }
        
        if (!changed) {
            throw new RuntimeException("Không có thông tin nào được thay đổi!");
        }
        
        ThuPhiHoKhau updated = repo.save(existing);
        
        log.info("✅ Successfully updated payment record ID={}", id);
        
        return toResponseDto(updated);
    }

    /**
     * Xóa bản ghi thu phí
     */
    @Transactional
    public void delete(Long id, Authentication auth) {
        log.info("Deleting payment record ID={}", id);
        
        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy bản ghi thu phí với ID = " + id);
        }
        
        repo.deleteById(id);
        
        log.info("✅ Successfully deleted payment record ID={}", id);
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
        log.info("🔄 Recalculating fees for household ID={}", hoKhauId);
        
        // Validate household exists
        hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID = " + hoKhauId));
        
        // Count current eligible members
        int currentMemberCount = countEligibleMembers(hoKhauId);
        log.info("Current eligible members: {}", currentMemberCount);
        
        // Find all fee records for this household
        List<ThuPhiHoKhau> feeRecords = repo.findByHoKhauId(hoKhauId);
        
        if (feeRecords.isEmpty()) {
            log.info("No fee records found for household ID={}", hoKhauId);
            return;
        }
        
        log.info("Recalculating {} fee record(s)", feeRecords.size());
        
        int updatedCount = 0;
        for (ThuPhiHoKhau record : feeRecords) {
            DotThuPhi dotThuPhi = record.getDotThuPhi();
            
            // Skip voluntary fees (don't recalculate)
            if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
                log.debug("Skipping voluntary fee record ID={}", record.getId());
                continue;
            }
            
            // Recalculate for mandatory fees
            int oldSoNguoi = record.getSoNguoi();
            BigDecimal oldTongPhi = record.getTongPhi();
            
            int months = calculateMonthsInPeriod(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());
            BigDecimal newTongPhi = calculateTotalFee(currentMemberCount, dotThuPhi.getDinhMuc(), months);
            
            record.setSoNguoi(currentMemberCount);
            record.setTongPhi(newTongPhi);
            
            // DO NOT change status - keep as-is
            
            repo.save(record);
            
            log.info("✅ Updated record ID={}: {} → {} members, {} → {} VND", 
                     record.getId(), oldSoNguoi, currentMemberCount, oldTongPhi, newTongPhi);
            
            updatedCount++;
        }
        
        log.info("✅ Completed recalculation for household ID={}. Updated {} record(s).", 
                 hoKhauId, updatedCount);
    }

    /**
     * Tạo bản ghi thu phí ban đầu cho hộ khẩu mới
     * Sử dụng đợt thu phí gần nhất
     */
    @Transactional
    public void createInitialFeeRecord(Long hoKhauId) {
        log.info("🆕 Creating initial fee record for new household ID={}", hoKhauId);
        
        HoKhau hoKhau = hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID = " + hoKhauId));
        
        List<DotThuPhi> dotThuPhiList = dotThuPhiRepo.findAll();
        
        if (dotThuPhiList.isEmpty()) {
            log.warn("⚠️ No fee periods found. Cannot create initial fee record.");
            return;
        }
        
        // Use first available fee period
        DotThuPhi dotThuPhi = dotThuPhiList.get(0);
        
        int soNguoi;
        BigDecimal tongPhi;
        TrangThaiThuPhi trangThai;
        
        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            soNguoi = 0;
            tongPhi = BigDecimal.ZERO;
            trangThai = TrangThaiThuPhi.KHONG_AP_DUNG;
        } else {
            soNguoi = countEligibleMembers(hoKhauId);
            int months = calculateMonthsInPeriod(dotThuPhi.getNgayBatDau(), dotThuPhi.getNgayKetThuc());
            tongPhi = calculateTotalFee(soNguoi, dotThuPhi.getDinhMuc(), months);
            trangThai = TrangThaiThuPhi.CHUA_NOP; // Not yet paid
        }
        
        ThuPhiHoKhau newRecord = ThuPhiHoKhau.builder()
                .hoKhau(hoKhau)
                .dotThuPhi(dotThuPhi)
                .soNguoi(soNguoi)
                .tongPhi(tongPhi)
                .trangThai(trangThai)
                .ngayThu(null)
                .ghiChu("Tự động tạo khi tạo hộ khẩu mới")
            .collectedBy(null)
                .build();
        
        ThuPhiHoKhau saved = repo.save(newRecord);
        
        log.info("✅ Created initial fee record ID={} for household '{}': {} members, {} VND, status: {}", 
                 saved.getId(), hoKhau.getSoHoKhau(), soNguoi, tongPhi, trangThai);
    }

    /**
     * Xóa tất cả bản ghi thu phí của một hộ khẩu
     * (Được gọi khi xóa hộ khẩu)
     */
    @Transactional
    public void deleteAllForHousehold(Long hoKhauId) {
        log.info("🗑️ Deleting all fee records for household ID={}", hoKhauId);
        
        List<ThuPhiHoKhau> feeRecords = repo.findByHoKhauId(hoKhauId);
        
        if (feeRecords.isEmpty()) {
            log.info("No fee records found for household ID={}", hoKhauId);
            return;
        }
        
        int count = feeRecords.size();
        repo.deleteAll(feeRecords);
        
        log.info("✅ Deleted {} fee record(s) for household ID={}", count, hoKhauId);
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
        
        long unpaidCount = all.stream()
                .filter(t -> t.getTrangThai() == TrangThaiThuPhi.CHUA_NOP)
                .count();
        
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
     * Đếm số người đủ điều kiện trong hộ khẩu
     * 
     * LOẠI TRỪ:
     * - Người tạm vắng (tam_vang_den >= ngày hiện tại)
     * - Người đã khai tử (ngay_khai_tu != null)
     */
    private int countEligibleMembers(Long hoKhauId) {
        List<NhanKhau> allMembers = nhanKhauRepo.findByHoKhauId(hoKhauId);
        LocalDate today = LocalDate.now();
        
        long count = allMembers.stream()
                .filter(member -> {
                    // Exclude temporarily absent members
                    LocalDate tamVangDen = member.getTamVangDen();
                    if (tamVangDen != null && !tamVangDen.isBefore(today)) {
                        return false;
                    }
                    
                    // Exclude deceased members (if you have this field - uncomment if needed)
                    // LocalDate ngayKhaiTu = member.getNgayKhaiTu();
                    // if (ngayKhaiTu != null) {
                    //     return false;
                    // }
                    
                    return true;
                })
                .count();
        
        return (int) count;
    }

    /**
     * Tính số tháng trong kỳ thu phí
     * 
     * QUY TẮC:
     * - Sử dụng ChronoUnit.MONTHS.between()
     * - Nếu ngày kết thúc không phải đầu tháng → làm tròn lên
     * - Tối thiểu 1 tháng
     * 
     * VÍ DỤ:
     * - 01/01 đến 31/01: 1 tháng
     * - 01/01 đến 01/02: 1 tháng
     * - 01/01 đến 10/02: 2 tháng (làm tròn lên)
     * - 01/01 đến 31/12: 12 tháng
     */
    private int calculateMonthsInPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            log.warn("Missing period dates, defaulting to 12 months");
            return 12;
        }
        
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("Ngày kết thúc không thể trước ngày bắt đầu!");
        }
        
        // Calculate full months between dates
        long fullMonths = ChronoUnit.MONTHS.between(startDate, endDate);
        
        // Check if there are remaining days (partial month)
        LocalDate afterFullMonths = startDate.plusMonths(fullMonths);
        boolean hasPartialMonth = afterFullMonths.isBefore(endDate);
        
        // Round up if partial month exists
        int totalMonths = (int) fullMonths + (hasPartialMonth ? 1 : 0);
        
        // Minimum 1 month
        if (totalMonths < 1) {
            totalMonths = 1;
        }
        
        log.debug("Period {} to {} = {} months (partial: {})", 
                  startDate, endDate, totalMonths, hasPartialMonth);
        
        return totalMonths;
    }

    /**
     * Tính tổng phí
     * 
     * Công thức: tongPhi = dinhMuc × months × soNguoi
     */
    private BigDecimal calculateTotalFee(int numberOfPeople, BigDecimal monthlyFeePerPerson, int months) {
        return monthlyFeePerPerson
                .multiply(BigDecimal.valueOf(months))
                .multiply(BigDecimal.valueOf(numberOfPeople));
    }

    /**
     * Validate ngày thu phí phải nằm trong khoảng đợt thu phí
     */
    private void validatePaymentDate(LocalDate ngayThu, DotThuPhi dotThuPhi) {
        if (ngayThu == null) {
            return; // Allow null payment date
        }
        
        LocalDate ngayBatDau = dotThuPhi.getNgayBatDau();
        LocalDate ngayKetThuc = dotThuPhi.getNgayKetThuc();
        
        if (ngayBatDau != null && ngayThu.isBefore(ngayBatDau)) {
            throw new RuntimeException(String.format(
                    "Đợt thu phí '%s' chưa bắt đầu. Ngày thu phải từ %s trở đi.",
                    dotThuPhi.getTenDot(), ngayBatDau));
        }
        
        if (ngayKetThuc != null && ngayThu.isAfter(ngayKetThuc)) {
            throw new RuntimeException(String.format(
                    "Đợt thu phí '%s' đã kết thúc vào %s. Không thể ghi nhận thanh toán sau ngày này.",
                    dotThuPhi.getTenDot(), ngayKetThuc));
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     */
    private TaiKhoan getCurrentUser(Authentication auth) {
        return taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng hiện tại"));
    }

    /**
     * Chuyển đổi Entity -> Response DTO
     */
    private ThuPhiHoKhauResponseDto toResponseDto(ThuPhiHoKhau entity) {
        return ThuPhiHoKhauResponseDto.builder()
                .id(entity.getId())
                .hoKhauId(entity.getHoKhau().getId())
                .soHoKhau(entity.getHoKhau().getSoHoKhau())
                .tenChuHo(entity.getHoKhau().getTenChuHo())
                .dotThuPhiId(entity.getDotThuPhi().getId())
                .tenDot(entity.getDotThuPhi().getTenDot())
                .soNguoi(entity.getSoNguoi())
                .tongPhi(entity.getTongPhi())
                .trangThai(entity.getTrangThai())
                .ngayThu(entity.getNgayThu())
                .ghiChu(entity.getGhiChu())
                .collectedBy(entity.getCollectedBy())
                .build();
    }
}
