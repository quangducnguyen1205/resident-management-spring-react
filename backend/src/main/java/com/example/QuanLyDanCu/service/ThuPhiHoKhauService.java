package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.ThuPhiHoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.ThuPhiHoKhauResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.ThuPhiHoKhau;
import com.example.QuanLyDanCu.enums.TrangThaiThuPhi;
import com.example.QuanLyDanCu.repository.DotThuPhiRepository;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.repository.ThuPhiHoKhauRepository;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
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
    private BigDecimal calculateAnnualFee(int numberOfPeople) {
        return MONTHLY_FEE
                .multiply(BigDecimal.valueOf(MONTHS_PER_YEAR))
                .multiply(BigDecimal.valueOf(numberOfPeople));
    }

    /**
     * Xác định trạng thái dựa trên số tiền đã thu
     */
    private TrangThaiThuPhi determineStatus(BigDecimal soTienDaThu, BigDecimal tongPhi) {
        if (soTienDaThu == null || soTienDaThu.compareTo(BigDecimal.ZERO) == 0) {
            return TrangThaiThuPhi.CHUA_NOP;
        }
        return soTienDaThu.compareTo(tongPhi) >= 0 ? 
                TrangThaiThuPhi.DA_NOP : TrangThaiThuPhi.CHUA_NOP;
    }

    // Thêm thu phí mới
    @Transactional
    public ThuPhiHoKhauResponseDto create(ThuPhiHoKhauRequestDto dto, Authentication auth) {
        checkPermission(auth);

        HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));

        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));

        TaiKhoan user = getCurrentUser(auth);

        // Tính số người và tổng phí tự động
        int soNguoi = countActiveMembersInHousehold(dto.getHoKhauId());
        BigDecimal tongPhi = calculateAnnualFee(soNguoi);
        TrangThaiThuPhi trangThai = determineStatus(dto.getSoTienDaThu(), tongPhi);

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
        return toResponseDto(saved);
    }

    // Cập nhật thu phí
    @Transactional
    public ThuPhiHoKhauResponseDto update(Long id, ThuPhiHoKhauRequestDto dto, Authentication auth) {
        checkPermission(auth);

        ThuPhiHoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thu phí id = " + id));

        // Nếu thay đổi hộ khẩu, cần tính lại số người và tổng phí
        boolean hoKhauChanged = false;
        if (dto.getHoKhauId() != null && !dto.getHoKhauId().equals(existing.getHoKhau().getId())) {
            HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));
            existing.setHoKhau(hoKhau);
            hoKhauChanged = true;
        }

        if (dto.getDotThuPhiId() != null && !dto.getDotThuPhiId().equals(existing.getDotThuPhi().getId())) {
            DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));
            existing.setDotThuPhi(dotThuPhi);
        }

        // Nếu thay đổi hộ khẩu, tính lại số người và tổng phí
        if (hoKhauChanged) {
            int soNguoi = countActiveMembersInHousehold(existing.getHoKhau().getId());
            BigDecimal tongPhi = calculateAnnualFee(soNguoi);
            existing.setSoNguoi(soNguoi);
            existing.setTongPhi(tongPhi);
        }

        // Cập nhật số tiền đã thu
        if (dto.getSoTienDaThu() != null) {
            existing.setSoTienDaThu(dto.getSoTienDaThu());
        }

        // Tự động cập nhật trạng thái
        TrangThaiThuPhi trangThai = determineStatus(existing.getSoTienDaThu(), existing.getTongPhi());
        existing.setTrangThai(trangThai);

        if (dto.getNgayThu() != null) {
            existing.setNgayThu(dto.getNgayThu());
        }
        if (dto.getGhiChu() != null) {
            existing.setGhiChu(dto.getGhiChu());
        }

        ThuPhiHoKhau updated = repo.save(existing);
        return toResponseDto(updated);
    }

    // Xóa thu phí
    @Transactional
    public void delete(Long id, Authentication auth) {
        checkPermission(auth);

        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy thu phí id = " + id);
        }
        repo.deleteById(id);
    }

    // Helper methods
    private void checkPermission(Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("KETOAN")) {
            throw new AccessDeniedException("Chỉ kế toán mới có quyền thực hiện thao tác này!");
        }
    }

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
        BigDecimal totalFee = calculateAnnualFee(memberCount);
        
        // Build response
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hoKhauId", hoKhauId);
        result.put("soHoKhau", hoKhau.getSoHoKhau());
        result.put("tenChuHo", hoKhau.getTenChuHo());
        result.put("dotThuPhiId", dotThuPhiId);
        result.put("tenDot", dotThuPhi.getTenDot());
        result.put("memberCount", memberCount);
        result.put("monthlyFeePerPerson", MONTHLY_FEE);
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
}
