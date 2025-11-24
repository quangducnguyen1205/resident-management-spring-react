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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service quản lý thu phí hộ khẩu.
 * 
 * <h2>Phân loại phí:</h2>
 * 
 * <h3>1. Phí BẮT BUỘC (BAT_BUOC):</h3>
 * <ul>
 *   <li><b>định_mức:</b> Phải > 0 (ví dụ: 6,000 VND/người/tháng)</li>
 *   <li><b>so_nguoi:</b> Tính tự động theo số người trong hộ (không bao gồm tạm vắng)</li>
 *   <li><b>tong_phi:</b> Tính tự động = định_mức × 12 × so_nguoi</li>
 *   <li><b>trang_thai:</b> CHUA_NOP (thiếu) hoặc DA_NOP (đủ) dựa trên so_tien_da_thu</li>
 *   <li><b>Tự động recalculate:</b> ✅ Khi thêm/xóa nhân khẩu</li>
 * </ul>
 * 
 * <h3>2. Phí TỰ NGUYỆN (TU_NGUYEN):</h3>
 * <ul>
 *   <li><b>định_mức:</b> Mặc định = 0 (người dân tự quyết định số tiền đóng góp)</li>
 *   <li><b>so_nguoi:</b> Luôn = 0 (không tính theo số người)</li>
 *   <li><b>tong_phi:</b> Luôn = 0 (không yêu cầu số tiền cố định)</li>
 *   <li><b>trang_thai:</b> KHONG_AP_DUNG (không áp dụng logic nộp đủ/thiếu)</li>
 *   <li><b>so_tien_da_thu:</b> Ghi nhận số tiền thực tế người dân đã đóng góp</li>
 *   <li><b>Tự động recalculate:</b> ❌ KHÔNG recalculate (phí tự nguyện không phụ thuộc số người)</li>
 * </ul>
 * 
 * <h2>Logic tự động:</h2>
 * <ul>
 *   <li><b>Tạo hộ khẩu mới:</b> Tự động tạo ThuPhiHoKhau cho đợt phí hiện tại</li>
 *   <li><b>Thêm/xóa nhân khẩu:</b> Tự động recalculate CHỈ cho phí BAT_BUOC</li>
 *   <li><b>Cập nhật trạng thái:</b> Tự động khi thu tiền (so_tien_da_thu >= tong_phi)</li>
 * </ul>
 * 
 * @see LoaiThuPhi
 * @see TrangThaiThuPhi
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

    private static final BigDecimal MONTHLY_FEE = new BigDecimal("6000");
    private static final int MONTHS_PER_YEAR = 12;

    // Lấy tất cả thu phí
    public List<ThuPhiHoKhauResponseDto> getAll() {
        return repo.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy thu phí theo id
    public ThuPhiHoKhauResponseDto getById(Long id) {
        ThuPhiHoKhau entity = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thu phí id = " + id));
        return toResponseDto(entity);
    }

    // Lấy thu phí theo hộ khẩu
    public List<ThuPhiHoKhauResponseDto> findByHoKhauId(Long hoKhauId) {
        return repo.findByHoKhauId(hoKhauId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy thu phí theo đợt thu
    public List<ThuPhiHoKhauResponseDto> findByDotThuPhiId(Long dotThuPhiId) {
        return repo.findByDotThuPhiId(dotThuPhiId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số người trong hộ (không bao gồm người tạm vắng dài hạn)
     * Quy tắc: Loại trừ người có tam_vang_den IS NOT NULL AND tam_vang_den >= CURRENT_DATE
     */
    private int countActiveMembersInHousehold(Long hoKhauId) {
        List<NhanKhau> allMembers = nhanKhauRepo.findByHoKhauId(hoKhauId);
        LocalDate today = LocalDate.now();
        
        return (int) allMembers.stream()
                .filter(member -> {
                    // Loại trừ người tạm vắng dài hạn
                    LocalDate tamVangDen = member.getTamVangDen();
                    return tamVangDen == null || tamVangDen.isBefore(today);
                })
                .count();
    }

    /**
     * Tính tổng phí hàng năm: 6000 * 12 * số_người
     */
    private BigDecimal calculateAnnualFee(int numberOfPeople, BigDecimal monthlyFeePerPerson) {
        return monthlyFeePerPerson
                .multiply(BigDecimal.valueOf(MONTHS_PER_YEAR))
                .multiply(BigDecimal.valueOf(numberOfPeople));
    }

    /**
     * Calculate total amount paid across ALL payment records for the same household and fee period.
     * This handles the case where a household makes multiple partial payments.
     * 
     * @param hoKhauId The household ID
     * @param dotThuPhiId The fee period ID
     * @return Sum of soTienDaThu across all related records
     */
    private BigDecimal calculateTotalPaid(Long hoKhauId, Long dotThuPhiId) {
        List<ThuPhiHoKhau> allPayments = repo.findByHoKhauIdAndDotThuPhiId(hoKhauId, dotThuPhiId);
        return allPayments.stream()
                .map(payment -> payment.getSoTienDaThu() != null ? payment.getSoTienDaThu() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Xác định trạng thái dựa trên TỔNG số tiền đã thu (từ tất cả các khoản thanh toán) và loại phí.
     * 
     * IMPORTANT: totalPaid is the SUM of all soTienDaThu for the same hoKhauId + dotThuPhiId,
     * not just a single payment record.
     * 
     * @param totalPaid Total amount paid across all payment records
     * @param tongPhi Required total fee
     * @param loaiPhi Fee type (mandatory or voluntary)
     * @return Status based on whether total paid meets or exceeds required fee
     */
    private TrangThaiThuPhi determineStatus(BigDecimal totalPaid, BigDecimal tongPhi, LoaiThuPhi loaiPhi) {
        // For voluntary fees, status is always KHONG_AP_DUNG
        if (loaiPhi == LoaiThuPhi.TU_NGUYEN) {
            return TrangThaiThuPhi.KHONG_AP_DUNG;
        }
        
        // For mandatory fees, compare TOTAL paid vs required fee
        if (totalPaid == null || totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            return TrangThaiThuPhi.CHUA_NOP;
        }
        return totalPaid.compareTo(tongPhi) >= 0 ? 
                TrangThaiThuPhi.DA_NOP : TrangThaiThuPhi.CHUA_NOP;
    }

    /**
     * Validate that payment date falls within the fee period date range.
     * 
     * @param ngayThu Payment date
     * @param dotThuPhi Fee period with start and end dates
     * @throws RuntimeException if ngayThu is outside the valid range
     */
    private void validatePaymentDate(LocalDate ngayThu, DotThuPhi dotThuPhi) {
        if (ngayThu == null) {
            return; // Allow null payment date (optional field)
        }
        
        LocalDate ngayBatDau = dotThuPhi.getNgayBatDau();
        LocalDate ngayKetThuc = dotThuPhi.getNgayKetThuc();
        
        if (ngayBatDau != null && ngayThu.isBefore(ngayBatDau)) {
            throw new RuntimeException(
                String.format("Đợt thu phí '%s' chưa bắt đầu. Ngày thu phải từ %s trở đi.",
                    dotThuPhi.getTenDot(), 
                    ngayBatDau.toString())
            );
        }
        
        if (ngayKetThuc != null && ngayThu.isAfter(ngayKetThuc)) {
            throw new RuntimeException(
                String.format("Đợt thu phí '%s' đã kết thúc vào %s. Không thể ghi nhận thanh toán sau ngày này.",
                    dotThuPhi.getTenDot(),
                    ngayKetThuc.toString())
            );
        }
        
        log.info("Payment date validation passed: ngayThu={} is within period range [{}, {}]",
                ngayThu, ngayBatDau, ngayKetThuc);
    }

    /**
     * Update status for ALL payment records of the same household and fee period.
     * This ensures consistent status across multiple partial payments.
     * 
     * When a household pays 100,000 + 1,100,000 for a 1,200,000 fee,
     * BOTH records should show DA_NOP status.
     * 
     * @param hoKhauId The household ID
     * @param dotThuPhiId The fee period ID
     */
    @Transactional
    private void updateAllRelatedRecordsStatus(Long hoKhauId, Long dotThuPhiId) {
        // Find all payment records for this household + fee period
        List<ThuPhiHoKhau> allPayments = repo.findByHoKhauIdAndDotThuPhiId(hoKhauId, dotThuPhiId);
        
        if (allPayments.isEmpty()) {
            return;
        }
        
        // Calculate total paid across all payments
        BigDecimal totalPaid = calculateTotalPaid(hoKhauId, dotThuPhiId);
        
        // Get required fee from any record (they all have same tongPhi for same period)
        ThuPhiHoKhau firstRecord = allPayments.get(0);
        BigDecimal tongPhi = firstRecord.getTongPhi();
        LoaiThuPhi loaiPhi = firstRecord.getDotThuPhi().getLoai();
        
        // Determine status based on total paid
        TrangThaiThuPhi newStatus = determineStatus(totalPaid, tongPhi, loaiPhi);
        
        // Update status for ALL related records
        for (ThuPhiHoKhau payment : allPayments) {
            payment.setTrangThai(newStatus);
            repo.save(payment);
        }
        
        log.info("Updated status for {} payment records (hoKhauId={}, dotThuPhiId={}): totalPaid={}, tongPhi={}, status={}",
                allPayments.size(), hoKhauId, dotThuPhiId, totalPaid, tongPhi, newStatus);
    }

    // Thêm thu phí mới
    @Transactional
    public ThuPhiHoKhauResponseDto create(ThuPhiHoKhauRequestDto dto, Authentication auth) {
        HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));

        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));

        // VALIDATE: Ensure payment date falls within fee period range
        validatePaymentDate(dto.getNgayThu(), dotThuPhi);

        TaiKhoan user = getCurrentUser(auth);

        // For voluntary fees, skip automatic calculation
        int soNguoi;
        BigDecimal tongPhi;
        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            soNguoi = 0;  // Not applicable for voluntary fees
            tongPhi = BigDecimal.ZERO;
        } else {
            // Tính số người và tổng phí tự động cho phí bắt buộc
            soNguoi = countActiveMembersInHousehold(dto.getHoKhauId());
            tongPhi = calculateAnnualFee(soNguoi, dotThuPhi.getDinhMuc());
        }
        
        // Initial status will be recalculated after save
        TrangThaiThuPhi trangThai = TrangThaiThuPhi.CHUA_NOP;

        // Tự động tạo period description
        String periodDescription = "Cả năm " + LocalDate.now().getYear();

        ThuPhiHoKhau entity = ThuPhiHoKhau.builder()
                .hoKhau(hoKhau)
                .dotThuPhi(dotThuPhi)
                .soNguoi(soNguoi)
                .tongPhi(tongPhi)
                .soTienDaThu(dto.getSoTienDaThu())
                .trangThai(trangThai)
                .periodDescription(periodDescription)
                .ngayThu(dto.getNgayThu())
                .ghiChu(dto.getGhiChu())
                .collectedBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        ThuPhiHoKhau saved = repo.save(entity);
        
        // CRITICAL: Update status for ALL records with same hoKhauId + dotThuPhiId
        // This handles multiple partial payments correctly
        updateAllRelatedRecordsStatus(dto.getHoKhauId(), dto.getDotThuPhiId());
        
        // Reload to get updated status
        saved = repo.findById(saved.getId())
                .orElseThrow(() -> new RuntimeException("Failed to reload saved record"));
        
        return toResponseDto(saved);
    }

    // Cập nhật thu phí
    @Transactional
    public ThuPhiHoKhauResponseDto update(Long id, ThuPhiHoKhauRequestDto dto, Authentication auth) {
        ThuPhiHoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thu phí id = " + id));

        // Track which household and period we're updating
        Long hoKhauId = existing.getHoKhau().getId();
        Long dotThuPhiId = existing.getDotThuPhi().getId();

        // VALIDATE: If ngayThu is being updated, ensure it's within period range
        if (dto.getNgayThu() != null) {
            validatePaymentDate(dto.getNgayThu(), existing.getDotThuPhi());
        }

        // Nếu thay đổi hộ khẩu, cần tính lại số người và tổng phí
        boolean hoKhauChanged = false;
        if (dto.getHoKhauId() != null && !dto.getHoKhauId().equals(existing.getHoKhau().getId())) {
            HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));
            existing.setHoKhau(hoKhau);
            hoKhauId = dto.getHoKhauId(); // Update tracked ID
            hoKhauChanged = true;
        }

        if (dto.getDotThuPhiId() != null && !dto.getDotThuPhiId().equals(existing.getDotThuPhi().getId())) {
            DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));
            existing.setDotThuPhi(dotThuPhi);
            dotThuPhiId = dto.getDotThuPhiId(); // Update tracked ID
        }

        // Nếu thay đổi hộ khẩu, tính lại số người và tổng phí
        if (hoKhauChanged) {
            int soNguoi = countActiveMembersInHousehold(existing.getHoKhau().getId());
            DotThuPhi dotThuPhi = existing.getDotThuPhi();
            BigDecimal tongPhi = calculateAnnualFee(soNguoi, dotThuPhi.getDinhMuc());
            existing.setSoNguoi(soNguoi);
            existing.setTongPhi(tongPhi);
        }

        // Cập nhật số tiền đã thu
        if (dto.getSoTienDaThu() != null) {
            existing.setSoTienDaThu(dto.getSoTienDaThu());
        }

        // Don't set status here - it will be recalculated for all related records

        if (dto.getNgayThu() != null) {
            existing.setNgayThu(dto.getNgayThu());
        }
        if (dto.getGhiChu() != null) {
            existing.setGhiChu(dto.getGhiChu());
        }

        ThuPhiHoKhau updated = repo.save(existing);
        
        // CRITICAL: Update status for ALL records with same hoKhauId + dotThuPhiId
        // This handles multiple partial payments correctly
        updateAllRelatedRecordsStatus(hoKhauId, dotThuPhiId);
        
        // Reload to get updated status
        updated = repo.findById(updated.getId())
                .orElseThrow(() -> new RuntimeException("Failed to reload updated record"));
        
        return toResponseDto(updated);
    }

    // Xóa thu phí
    @Transactional
    public void delete(Long id, Authentication auth) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thu phí id = " + id);
        }
        repo.deleteById(id);
    }

    // Helper methods

    private TaiKhoan getCurrentUser(Authentication auth) {
        return taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }

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
                .soTienDaThu(entity.getSoTienDaThu())
                .trangThai(entity.getTrangThai())
                .periodDescription(entity.getPeriodDescription())
                .ngayThu(entity.getNgayThu())
                .ghiChu(entity.getGhiChu())
                .collectedBy(entity.getCollectedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    // Tính toán tổng phí cho hộ khẩu
    public Map<String, Object> calculateTotalFee(Long hoKhauId, Long dotThuPhiId) {
        // Fetch HoKhau
        HoKhau hoKhau = hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + hoKhauId));
        
        // Fetch DotThuPhi
        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dotThuPhiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dotThuPhiId));
        
        // Đếm số người (loại trừ tạm vắng)
        int memberCount = countActiveMembersInHousehold(hoKhauId);
        
        // Tính phí hàng năm
        BigDecimal totalFee = calculateAnnualFee(memberCount, dotThuPhi.getDinhMuc());
        
        // Build response
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hoKhauId", hoKhauId);
        result.put("soHoKhau", hoKhau.getSoHoKhau());
        result.put("tenChuHo", hoKhau.getTenChuHo());
        result.put("dotThuPhiId", dotThuPhiId);
        result.put("tenDot", dotThuPhi.getTenDot());
        result.put("memberCount", memberCount);
        result.put("monthlyFeePerPerson", dotThuPhi.getDinhMuc());
        result.put("monthsPerYear", MONTHS_PER_YEAR);
        result.put("totalFee", totalFee);
        result.put("formula", String.format("%s * %d * %d = %s", 
                MONTHLY_FEE, MONTHS_PER_YEAR, memberCount, totalFee));
        
        return result;
    }

    // Thống kê thu phí
    public Map<String, Object> getStats() {
        List<ThuPhiHoKhau> all = repo.findAll();
        long totalRecords = all.size();
        BigDecimal totalCollected = all.stream()
                .map(t -> t.getSoTienDaThu() != null ? t.getSoTienDaThu() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long paidCount = all.stream()
                .filter(t -> t.getTrangThai() == TrangThaiThuPhi.DA_NOP)
                .count();
        
        long unpaidCount = all.stream()
                .filter(t -> t.getTrangThai() == TrangThaiThuPhi.CHUA_NOP)
                .count();
        
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRecords", totalRecords);
        stats.put("totalCollected", totalCollected);
        stats.put("totalHouseholds", all.stream().map(t -> t.getHoKhau().getId()).distinct().count());
        stats.put("paidRecords", paidCount);
        stats.put("unpaidRecords", unpaidCount);
        
        return stats;
    }

    /**
     * Recalculate fees for a specific household across all fee periods.
     * This is triggered by events when household or citizen data changes.
     * 
     * @param hoKhauId The household ID to recalculate fees for
     */
    @Transactional
    public void recalculateForHousehold(Long hoKhauId) {
        log.info("🔄 Starting fee recalculation for household: {}", hoKhauId);
        
        // Verify household exists
        hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + hoKhauId));
        
        // Count current eligible members (excluding tam_vang)
        int activeMemberCount = countActiveMembersInHousehold(hoKhauId);
        log.info("📊 Household {} has {} active members (excluding temporarily absent)", 
                  hoKhauId, activeMemberCount);
        
        // Find all ThuPhiHoKhau records for this household
        List<ThuPhiHoKhau> feeRecords = repo.findByHoKhauId(hoKhauId);
        
        if (feeRecords.isEmpty()) {
            log.info("⚠️  No fee records found for household {}. Skipping recalculation.", hoKhauId);
            return;
        }
        
        log.info("📋 Found {} fee record(s) to recalculate for household {}", feeRecords.size(), hoKhauId);
        
        // Recalculate each fee record
        int updatedCount = 0;
        for (ThuPhiHoKhau record : feeRecords) {
            BigDecimal oldTongPhi = record.getTongPhi();
            int oldSoNguoi = record.getSoNguoi() != null ? record.getSoNguoi() : 0;
            
            // Get dinh_muc from the fee period
            DotThuPhi dotThuPhi = record.getDotThuPhi();
            BigDecimal dinhMuc = dotThuPhi.getDinhMuc();
            
            // Skip recalculation for voluntary fees
            if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
                log.debug("⏭️  Skipping recalculation for voluntary fee record ID {} (household {})", 
                          record.getId(), hoKhauId);
                // Ensure status is KHONG_AP_DUNG for voluntary fees
                if (record.getTrangThai() != TrangThaiThuPhi.KHONG_AP_DUNG) {
                    record.setTrangThai(TrangThaiThuPhi.KHONG_AP_DUNG);
                    repo.save(record);
                    log.info("💾 Updated status to KHONG_AP_DUNG for voluntary fee record ID {}", record.getId());
                }
                continue;
            }
            
            // Calculate new total fee for mandatory fees
            BigDecimal newTongPhi = calculateAnnualFee(activeMemberCount, dinhMuc);
            
            // Update record
            record.setSoNguoi(activeMemberCount);
            record.setTongPhi(newTongPhi);
            
            // Recalculate status based on new total
            TrangThaiThuPhi newStatus = determineStatus(record.getSoTienDaThu(), newTongPhi, dotThuPhi.getLoai());
            record.setTrangThai(newStatus);
            
            log.info("💾 Saving fee record ID {} before update: soNguoi={}, tongPhi={}, status={}", 
                     record.getId(), oldSoNguoi, oldTongPhi, record.getTrangThai());
            
            ThuPhiHoKhau saved = repo.save(record);
            
            log.info("✅ Updated fee record ID {} for household {}: soNguoi {} → {}, tongPhi {} → {}, status: {}", 
                     saved.getId(), hoKhauId, oldSoNguoi, activeMemberCount, 
                     oldTongPhi, newTongPhi, newStatus);
            
            updatedCount++;
        }
        
        log.info("✅ Completed fee recalculation for household {}. Updated {} mandatory fee record(s).", 
                 hoKhauId, updatedCount);
    }

    /**
     * Create ThuPhiHoKhau record for a newly created household.
     * Uses the most recent active fee period (DotThuPhi).
     * 
     * @param hoKhauId The newly created household ID
     */
    @Transactional
    public void createInitialFeeRecord(Long hoKhauId) {
        log.info("🆕 Creating initial fee record for new household: {}", hoKhauId);
        
        // Verify household exists
        HoKhau hoKhau = hoKhauRepo.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + hoKhauId));
        
        // Find the most recent active fee period
        List<DotThuPhi> dotThuPhiList = dotThuPhiRepo.findAll();
        if (dotThuPhiList.isEmpty()) {
            log.warn("⚠️  No fee periods (DotThuPhi) found. Cannot create initial fee record for household {}", hoKhauId);
            return;
        }
        
        log.info("📋 Found {} fee period(s). Using first one for initial fee record.", dotThuPhiList.size());
        
        // Use the first fee period (or most recent if sorted by ngayBatDau desc)
        DotThuPhi dotThuPhi = dotThuPhiList.get(0);
        
        // Determine calculation based on fee type
        int activeMemberCount;
        BigDecimal tongPhi;
        TrangThaiThuPhi trangThai;
        
        if (dotThuPhi.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            // Voluntary fees: no auto-calculation
            activeMemberCount = 0;
            tongPhi = BigDecimal.ZERO;
            trangThai = TrangThaiThuPhi.KHONG_AP_DUNG;
            log.info("🎁 Creating initial fee record for VOLUNTARY fee period '{}' - skipping calculation", 
                     dotThuPhi.getTenDot());
        } else {
            // Mandatory fees: calculate based on members
            activeMemberCount = countActiveMembersInHousehold(hoKhauId);
            tongPhi = calculateAnnualFee(activeMemberCount, dotThuPhi.getDinhMuc());
            trangThai = TrangThaiThuPhi.CHUA_NOP;
            log.info("📊 Creating initial fee record for MANDATORY fee period '{}': {} members → {} VND", 
                     dotThuPhi.getTenDot(), activeMemberCount, tongPhi);
        }
        
        // Create new fee record with zero payment
        ThuPhiHoKhau newRecord = ThuPhiHoKhau.builder()
                .hoKhau(hoKhau)
                .dotThuPhi(dotThuPhi)
                .soNguoi(activeMemberCount)
                .tongPhi(tongPhi)
                .soTienDaThu(BigDecimal.ZERO)
                .trangThai(trangThai)
                .periodDescription("Cả năm " + LocalDate.now().getYear())
                .ngayThu(null)
                .ghiChu("Tự động tạo khi tạo hộ khẩu mới")
                .collectedBy(null)
                .createdAt(LocalDateTime.now())
                .build();
        
        log.info("💾 Saving initial fee record to database...");
        ThuPhiHoKhau saved = repo.save(newRecord);
        
        log.info("✅ Created initial fee record ID {} for household {}: soNguoi={}, tongPhi={}, status={}", 
                 saved.getId(), hoKhauId, activeMemberCount, tongPhi, trangThai);
    }

    /**
     * Delete all ThuPhiHoKhau records for a household.
     * This is triggered when a household is deleted.
     * 
     * @param hoKhauId The household ID to delete fee records for
     */
    @Transactional
    public void deleteAllForHousehold(Long hoKhauId) {
        log.info("Deleting all fee records for household: {}", hoKhauId);
        
        List<ThuPhiHoKhau> feeRecords = repo.findByHoKhauId(hoKhauId);
        
        if (feeRecords.isEmpty()) {
            log.info("No fee records found for household {}. Nothing to delete.", hoKhauId);
            return;
        }
        
        int recordCount = feeRecords.size();
        repo.deleteAll(feeRecords);
        
        log.info("Deleted {} fee record(s) for household {}", recordCount, hoKhauId);
    }
}
