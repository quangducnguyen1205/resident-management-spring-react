package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DangKyTamTruTamVangRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.enums.BienDongType;
import com.example.QuanLyDanCu.exception.BadRequestException;
import com.example.QuanLyDanCu.exception.BusinessException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class NhanKhauService {

    private final NhanKhauRepository nhanKhauRepo;
    private final BienDongService bienDongService;
    private final ThuPhiHoKhauService thuPhiHoKhauService;

    // ========== DTO-based methods ==========

    // Lấy tất cả nhân khẩu (DTO)
    public List<NhanKhauResponseDto> getAll() {
        return nhanKhauRepo.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Lấy nhân khẩu theo id (DTO)
    public NhanKhauResponseDto getById(Long id) {
        NhanKhau nk = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        return toResponseDTO(nk);
    }

    // Thêm nhân khẩu mới (DTO)
    @Transactional
    public NhanKhauResponseDto create(NhanKhauRequestDto dto, Authentication auth) {
        // CCCD validation based on age
        validateCccdByAge(dto.getNgaySinh(), dto.getCmndCccd(), dto.getNgayCap(), dto.getNoiCap());

        NhanKhau nk = NhanKhau.builder()
                .hoTen(dto.getHoTen())
                .ngaySinh(dto.getNgaySinh())
                .gioiTinh(dto.getGioiTinh())
                .danToc(dto.getDanToc())
                .quocTich(dto.getQuocTich())
                .ngheNghiep(dto.getNgheNghiep())
                .cmndCccd(dto.getCmndCccd())
                .ngayCap(dto.getNgayCap())
                .noiCap(dto.getNoiCap())
                .quanHeChuHo(dto.getQuanHeChuHo())
                .ghiChu(dto.getGhiChu())
                .hoKhauId(dto.getHoKhauId())
                .build();

        NhanKhau saved = nhanKhauRepo.save(nk);
        
        bienDongService.log(
            BienDongType.THAY_DOI_THONG_TIN,
            "Tạo nhân khẩu mới: " + saved.getHoTen(),
            saved.getHoKhauId(),
            saved.getId());

        triggerFeeRecalculation(saved.getHoKhauId());
        
        return toResponseDTO(saved);
    }

    // Cập nhật nhân khẩu (DTO) - PARTIAL UPDATE SUPPORT
    @Transactional
    public NhanKhauResponseDto update(Long id, NhanKhauUpdateDto dto, Authentication auth) {

        NhanKhau existing = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        Long oldHoKhauId = existing.getHoKhauId();

        boolean changed = false;
        List<Consumer<NhanKhau>> pendingLogs = new ArrayList<>();

        // CCCD validation if ngaySinh is being updated
        LocalDate finalNgaySinh = dto.getNgaySinh() != null ? dto.getNgaySinh() : existing.getNgaySinh();
        String finalCmndCccd = dto.getCmndCccd() != null ? dto.getCmndCccd() : existing.getCmndCccd();
        LocalDate finalNgayCap = dto.getNgayCap() != null ? dto.getNgayCap() : existing.getNgayCap();
        String finalNoiCap = dto.getNoiCap() != null ? dto.getNoiCap() : existing.getNoiCap();
        
        // Validate CCCD based on age
        validateCccdByAge(finalNgaySinh, finalCmndCccd, finalNgayCap, finalNoiCap);

        // Cập nhật các trường thông tin cá nhân
        if (dto.getHoTen() != null && !Objects.equals(existing.getHoTen(), dto.getHoTen())) {
            String oldVal = existing.getHoTen();
            String newVal = dto.getHoTen();
            existing.setHoTen(newVal);
            changed = true;
            addChangeLog(pendingLogs, "họ tên", oldVal, newVal);
        }
        if (dto.getNgaySinh() != null && !Objects.equals(existing.getNgaySinh(), dto.getNgaySinh())) {
            LocalDate oldVal = existing.getNgaySinh();
            LocalDate newVal = dto.getNgaySinh();
            existing.setNgaySinh(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ngày sinh", oldVal, newVal);
        }
        if (dto.getGioiTinh() != null && !Objects.equals(existing.getGioiTinh(), dto.getGioiTinh())) {
            String oldVal = existing.getGioiTinh();
            String newVal = dto.getGioiTinh();
            existing.setGioiTinh(newVal);
            changed = true;
            addChangeLog(pendingLogs, "giới tính", oldVal, newVal);
        }
        if (dto.getDanToc() != null && !Objects.equals(existing.getDanToc(), dto.getDanToc())) {
            String oldVal = existing.getDanToc();
            String newVal = dto.getDanToc();
            existing.setDanToc(newVal);
            changed = true;
            addChangeLog(pendingLogs, "dân tộc", oldVal, newVal);
        }
        if (dto.getQuocTich() != null && !Objects.equals(existing.getQuocTich(), dto.getQuocTich())) {
            String oldVal = existing.getQuocTich();
            String newVal = dto.getQuocTich();
            existing.setQuocTich(newVal);
            changed = true;
            addChangeLog(pendingLogs, "quốc tịch", oldVal, newVal);
        }
        if (dto.getNgheNghiep() != null && !Objects.equals(existing.getNgheNghiep(), dto.getNgheNghiep())) {
            String oldVal = existing.getNgheNghiep();
            String newVal = dto.getNgheNghiep();
            existing.setNgheNghiep(newVal);
            changed = true;
            addChangeLog(pendingLogs, "nghề nghiệp", oldVal, newVal);
        }
        if (dto.getCmndCccd() != null && !Objects.equals(existing.getCmndCccd(), dto.getCmndCccd())) {
            String oldVal = existing.getCmndCccd();
            String newVal = dto.getCmndCccd();
            existing.setCmndCccd(newVal);
            changed = true;
            addChangeLog(pendingLogs, "CMND/CCCD", oldVal, newVal);
        }
        if (dto.getNgayCap() != null && !Objects.equals(existing.getNgayCap(), dto.getNgayCap())) {
            LocalDate oldVal = existing.getNgayCap();
            LocalDate newVal = dto.getNgayCap();
            existing.setNgayCap(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ngày cấp CMND/CCCD", oldVal, newVal);
        }
        if (dto.getNoiCap() != null && !Objects.equals(existing.getNoiCap(), dto.getNoiCap())) {
            String oldVal = existing.getNoiCap();
            String newVal = dto.getNoiCap();
            existing.setNoiCap(newVal);
            changed = true;
            addChangeLog(pendingLogs, "nơi cấp CMND/CCCD", oldVal, newVal);
        }
        if (dto.getQuanHeChuHo() != null && !Objects.equals(existing.getQuanHeChuHo(), dto.getQuanHeChuHo())) {
            String oldVal = existing.getQuanHeChuHo();
            String newVal = dto.getQuanHeChuHo();
            existing.setQuanHeChuHo(newVal);
            changed = true;
            addChangeLog(pendingLogs, "quan hệ với chủ hộ", oldVal, newVal);
        }
        if (dto.getGhiChu() != null && !Objects.equals(existing.getGhiChu(), dto.getGhiChu())) {
            String oldVal = existing.getGhiChu();
            String newVal = dto.getGhiChu();
            existing.setGhiChu(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ghi chú", oldVal, newVal);
        }
        if (dto.getHoKhauId() != null && !Objects.equals(existing.getHoKhauId(), dto.getHoKhauId())) {
            Long newHoKhauId = dto.getHoKhauId();
            existing.setHoKhauId(newHoKhauId);
            changed = true;
            final String citizenName = existing.getHoTen();
            pendingLogs.add(nk -> bienDongService.log(
                    BienDongType.CHUYEN_DI,
                    String.format("Nhân khẩu %s chuyển khỏi hộ %s", citizenName, oldHoKhauId),
                    oldHoKhauId,
                    nk.getId()));
            pendingLogs.add(nk -> bienDongService.log(
                    BienDongType.CHUYEN_DEN,
                    String.format("Nhân khẩu %s chuyển đến hộ %s", citizenName, newHoKhauId),
                    newHoKhauId,
                    nk.getId()));
        }

        if (!changed) {
            throw new BusinessException("Không có gì để thay đổi");
        }

        NhanKhau saved = nhanKhauRepo.save(existing);

        pendingLogs.forEach(callback -> callback.accept(saved));

        if (!Objects.equals(oldHoKhauId, saved.getHoKhauId())) {
            triggerFeeRecalculation(oldHoKhauId);
        }
        triggerFeeRecalculation(saved.getHoKhauId());

        return toResponseDTO(saved);
    }

    // Xóa nhân khẩu
    @Transactional
    public void delete(Long id, Authentication auth) {

        NhanKhau nk = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        
        Long hoKhauId = nk.getHoKhauId();

        BienDongType deletionType = "Đã mất".equalsIgnoreCase(nk.getGhiChu())
            ? BienDongType.KHAI_TU
            : BienDongType.THAY_DOI_THONG_TIN;
        String content = deletionType == BienDongType.KHAI_TU
            ? "Khai tử nhân khẩu khi xóa hồ sơ: " + nk.getHoTen()
            : "Xóa nhân khẩu " + nk.getHoTen();
        bienDongService.log(deletionType, content, hoKhauId, null);
        
        nhanKhauRepo.delete(nk);
        triggerFeeRecalculation(hoKhauId);
    }

    // --- TẠM TRÚ ---
    public NhanKhauResponseDto dangKyTamTru(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải bé hơn ngày kết thúc");
        }

        NhanKhau nk = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setTamTruTu(dto.getNgayBatDau());
        nk.setTamTruDen(dto.getNgayKetThuc());

        String content = "Đăng ký tạm trú cho " + nk.getHoTen()
            + " từ " + dto.getNgayBatDau()
            + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
            + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : "");
        bienDongService.log(BienDongType.TAM_TRU, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        return toResponseDTO(saved);
    }

    public void huyTamTru(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        existing.setTamTruTu(null);
        existing.setTamTruDen(null);

        bienDongService.log(
            BienDongType.HUY_TAM_TRU,
            "Hủy tạm trú cho " + existing.getHoTen(),
            existing.getHoKhauId(),
            existing.getId());
        nhanKhauRepo.save(existing);

    }


    // --- TẠM VẮNG ---
    public NhanKhauResponseDto dangKyTamVang(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải bé hơn ngày kết thúc");
        }

        NhanKhau nk = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setTamVangTu(dto.getNgayBatDau());
        nk.setTamVangDen(dto.getNgayKetThuc());

        String content = "Đăng ký tạm vắng cho " + nk.getHoTen()
            + " từ " + dto.getNgayBatDau()
            + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
            + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : "");
        bienDongService.log(BienDongType.TAM_VANG, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        triggerFeeRecalculation(saved.getHoKhauId());

        return toResponseDTO(saved);
    }

    public void huyTamVang(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        existing.setTamVangTu(null);
        existing.setTamVangDen(null);

        bienDongService.log(
            BienDongType.HUY_TAM_VANG,
            "Kết thúc tạm vắng cho " + existing.getHoTen(),
            existing.getHoKhauId(),
            existing.getId());
        nhanKhauRepo.save(existing);
        triggerFeeRecalculation(existing.getHoKhauId());
    }

    // --- KHAI TỬ ---
    public NhanKhauResponseDto khaiTu(Long id, String lyDo, Authentication auth) {
        NhanKhau nk = nhanKhauRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setGhiChu("Đã mất");
        nk.setTamTruTu(null);
        nk.setTamTruDen(null);
        nk.setTamVangTu(null);
        nk.setTamVangDen(null);

        String content = "Khai tử: " + nk.getHoTen() + (lyDo != null ? " - Lý do: " + lyDo : "");
        bienDongService.log(BienDongType.KHAI_TU, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        return toResponseDTO(saved);
    }

    // Search theo tên
    public java.util.List<com.example.QuanLyDanCu.entity.NhanKhau> searchByName(String keyword) {
        if (keyword == null || keyword.isBlank()) return java.util.Collections.emptyList();
        return nhanKhauRepo.findByHoTenContainingIgnoreCase(keyword.trim());
    }

    // Thống kê giới tính (toàn bộ)
    public java.util.Map<String, Object> statsGender() {
        var rows = nhanKhauRepo.countByGioiTinh();
        long total = 0;
        java.util.Map<String, Long> byGender = new java.util.LinkedHashMap<>();
        for (var r : rows) {
            String k = r.getGioiTinh() == null ? "Không xác định" : r.getGioiTinh();
            byGender.put(k, r.getTotal());
            total += r.getTotal();
        }
        java.util.Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("total", total);
        out.put("byGender", byGender);
        return out;
    }

    // Thống kê theo tuổi: thiếu nhi / đi làm / về hưu
    public java.util.Map<String, Object> statsByAge(java.lang.Integer underAge, java.lang.Integer retireAge) {
        int ua = (underAge == null || underAge <= 0) ? 16 : underAge;      // mặc định thiếu nhi <16
        int ra = (retireAge == null || retireAge <= ua) ? 60 : retireAge;  // mặc định về hưu >=60

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate cutoffChild  = today.minusYears(ua);
        java.time.LocalDate cutoffRetire = today.minusYears(ra);

        var rows = nhanKhauRepo.countByAgeBuckets(cutoffChild, cutoffRetire);

        java.util.Map<String, Long> totals = new java.util.LinkedHashMap<>();
        java.util.Map<String, java.util.Map<String, Long>> byGender = new java.util.LinkedHashMap<>();
        for (String b : new String[]{"CHILD", "WORKING", "RETIRED"}) {
            totals.put(b, 0L);
            byGender.put(b, new java.util.LinkedHashMap<>());
        }

        long grand = 0;
        for (var r : rows) {
            String bucket = r.getBucket();
            String gender = r.getGioiTinh() == null ? "Không xác định" : r.getGioiTinh();
            long c = r.getTotal();
            totals.put(bucket, totals.get(bucket) + c);
            var gmap = byGender.get(bucket);
            gmap.put(gender, gmap.getOrDefault(gender, 0L) + c);
            grand += c;
        }

        java.util.Map<String, Object> buckets = new java.util.LinkedHashMap<>();
        buckets.put("thieuNhi", java.util.Map.of(
                "label", "Thiếu nhi (< " + ua + ")",
                "total", totals.get("CHILD"),
                "byGender", byGender.get("CHILD")
        ));
        buckets.put("diLam", java.util.Map.of(
                "label", "Người đi làm (" + ua + "–" + (ra - 1) + ")",
                "total", totals.get("WORKING"),
                "byGender", byGender.get("WORKING")
        ));
        buckets.put("veHuu", java.util.Map.of(
                "label", "Người về hưu (≥ " + ra + ")",
                "total", totals.get("RETIRED"),
                "byGender", byGender.get("RETIRED")
        ));

        java.util.Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("underAge", ua);
        out.put("retireAge", ra);
        out.put("cutoffChildBirthdayAfter", cutoffChild);
        out.put("cutoffRetireBirthdayAfter", cutoffRetire);
        out.put("total", grand);
        out.put("buckets", buckets);
        return out;
    }

    private void triggerFeeRecalculation(Long hoKhauId) {
        if (hoKhauId == null) {
            return;
        }
        thuPhiHoKhauService.recalculateForHousehold(hoKhauId);
    }

    // Lấy tất cả nhân khẩu theo ID hộ khẩu (DTO)
    public List<NhanKhauResponseDto> getAllByHoKhauId(Long id) {
        if (id == null) {
            return java.util.Collections.emptyList();
        }

        List<NhanKhau> nhanKhaus = nhanKhauRepo.findByHoKhauId(id);
        return nhanKhaus.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // --- helper ---

    private void addChangeLog(List<Consumer<NhanKhau>> pendingLogs, String fieldLabel, Object oldValue, Object newValue) {
        final String message = formatChange(fieldLabel, oldValue, newValue);
        pendingLogs.add(nk -> bienDongService.log(
                BienDongType.THAY_DOI_THONG_TIN,
                message,
                nk.getHoKhauId(),
                nk.getId()));
    }

    private String formatChange(String fieldLabel, Object oldValue, Object newValue) {
        return String.format("Cập nhật %s: '%s' → '%s'",
                fieldLabel,
                formatValue(oldValue),
                formatValue(newValue));
    }

    private String formatValue(Object value) {
        return value == null ? "" : value.toString();
    }

    /**
     * Validate CCCD fields based on age
     * - If age < 14: all CCCD fields must be null/empty
     * - If age >= 14: all CCCD fields required, ngayCap must be >= ngaySinh + 14 years and <= today
     */
    private void validateCccdByAge(LocalDate ngaySinh, String cmndCccd, LocalDate ngayCap, String noiCap) {
        if (ngaySinh == null) {
            throw new BadRequestException("Ngày sinh không được để trống");
        }

        LocalDate today = LocalDate.now();
        int age = java.time.Period.between(ngaySinh, today).getYears();
        
        boolean hasCccdData = (cmndCccd != null && !cmndCccd.trim().isEmpty()) ||
                              (ngayCap != null) ||
                              (noiCap != null && !noiCap.trim().isEmpty());

        if (age < 14) {
            // Under 14: CCCD fields must be empty
            if (hasCccdData) {
                throw new BadRequestException(
                    "Người dưới 14 tuổi không được cấp CMND/CCCD. " +
                    "Vui lòng để trống các trường: CMND/CCCD, Ngày cấp, Nơi cấp"
                );
            }
        } else {
            // Age >= 14: All CCCD fields required
            if (cmndCccd == null || cmndCccd.trim().isEmpty()) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có CMND/CCCD");
            }
            if (ngayCap == null) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có ngày cấp CMND/CCCD");
            }
            if (noiCap == null || noiCap.trim().isEmpty()) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có nơi cấp CMND/CCCD");
            }
            
            // Validate CMND/CCCD format (9-12 digits)
            if (!cmndCccd.matches("\\d{9,12}")) {
                throw new BadRequestException("CMND/CCCD phải có 9-12 chữ số");
            }
            
            // Validate ngayCap >= ngaySinh + 14 years
            LocalDate minIssuanceDate = ngaySinh.plusYears(14);
            if (ngayCap.isBefore(minIssuanceDate)) {
                throw new BadRequestException(
                    "Ngày cấp CMND/CCCD phải sau ngày sinh ít nhất 14 năm (từ " + 
                    minIssuanceDate + " trở đi)"
                );
            }
            
            // Validate ngayCap <= today
            if (ngayCap.isAfter(today)) {
                throw new BadRequestException("Ngày cấp CMND/CCCD không được là ngày trong tương lai");
            }
        }
    }

    // Mapper: Entity -> Response DTO
    private NhanKhauResponseDto toResponseDTO(NhanKhau nk) {
        // Compute current status based on tam_vang/tam_tru dates
        LocalDate now = LocalDate.now();
        String trangThaiHienTai = "THUONG_TRU"; // default
        
        // Highest priority: citizen marked as deceased
        if (nk.getGhiChu() != null && nk.getGhiChu().trim().equalsIgnoreCase("đã mất")) {
            trangThaiHienTai = "DA_KHAI_TU";
        }
        // Check tam_vang next (higher priority than tam_tru)
        else if (nk.getTamVangTu() != null && 
            !now.isBefore(nk.getTamVangTu()) && 
            (nk.getTamVangDen() == null || !now.isAfter(nk.getTamVangDen()))) {
            trangThaiHienTai = "TAM_VANG";
        } 
        // Check tam_tru second
        else if (nk.getTamTruTu() != null && 
                 !now.isBefore(nk.getTamTruTu()) && 
                 (nk.getTamTruDen() == null || !now.isAfter(nk.getTamTruDen()))) {
            trangThaiHienTai = "TAM_TRU";
        }
        
        return NhanKhauResponseDto.builder()
                .id(nk.getId())
                .hoTen(nk.getHoTen())
                .ngaySinh(nk.getNgaySinh())
                .gioiTinh(nk.getGioiTinh())
                .danToc(nk.getDanToc())
                .quocTich(nk.getQuocTich())
                .ngheNghiep(nk.getNgheNghiep())
                .cmndCccd(nk.getCmndCccd())
                .ngayCap(nk.getNgayCap())
                .noiCap(nk.getNoiCap())
                .quanHeChuHo(nk.getQuanHeChuHo())
                .ghiChu(nk.getGhiChu())
                .tamVangTu(nk.getTamVangTu())
                .tamVangDen(nk.getTamVangDen())
                .tamTruTu(nk.getTamTruTu())
                .tamTruDen(nk.getTamTruDen())
                .trangThaiHienTai(trangThaiHienTai)
                .hoKhauId(nk.getHoKhauId())
                .build();
    }
}
