package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DangKyTamTruTamVangRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.event.ChangeOperation;
import com.example.QuanLyDanCu.event.NhanKhauChangedEvent;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
@Slf4j
public class NhanKhauService {

    private final NhanKhauRepository nhanKhauRepo;
    private final BienDongRepository bienDongRepo;
    private final TaiKhoanRepository taiKhoanRepo;
    private final ApplicationEventPublisher eventPublisher;

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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
        return toResponseDTO(nk);
    }

    // Thêm nhân khẩu mới (DTO)
    @Transactional
    public NhanKhauResponseDto create(NhanKhauRequestDto dto, Authentication auth) {

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

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
                .createdAt(LocalDateTime.now())
                .createdBy(user.getId())
                .updatedAt(LocalDateTime.now())
                .updatedBy(user.getId())
                .build();

        NhanKhau saved = nhanKhauRepo.save(nk);
        
        // Publish event to trigger ThuPhiHoKhau recalculation
        log.info("Publishing NhanKhauChangedEvent for newly created citizen: {} in household: {}", 
                 saved.getId(), saved.getHoKhauId());
        eventPublisher.publishEvent(new NhanKhauChangedEvent(this, saved.getId(), 
                                     saved.getHoKhauId(), ChangeOperation.CREATE));
        
        return toResponseDTO(saved);
    }

    // Cập nhật nhân khẩu (DTO) - PARTIAL UPDATE SUPPORT
    @Transactional
    public NhanKhauResponseDto update(Long id, NhanKhauUpdateDto dto, Authentication auth) {

        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        boolean changed = false;

        // CCCD validation if ngaySinh is being updated
        LocalDate finalNgaySinh = dto.getNgaySinh() != null ? dto.getNgaySinh() : existing.getNgaySinh();
        String finalCmndCccd = dto.getCmndCccd() != null ? dto.getCmndCccd() : existing.getCmndCccd();
        LocalDate finalNgayCap = dto.getNgayCap() != null ? dto.getNgayCap() : existing.getNgayCap();
        String finalNoiCap = dto.getNoiCap() != null ? dto.getNoiCap() : existing.getNoiCap();
        
        // Validate CCCD based on age
        validateCccdByAge(finalNgaySinh, finalCmndCccd, finalNgayCap, finalNoiCap);

        // Cập nhật các trường thông tin cá nhân
        if (dto.getHoTen() != null && !Objects.equals(existing.getHoTen(), dto.getHoTen())) {
            existing.setHoTen(dto.getHoTen());
            changed = true;
        }
        if (dto.getNgaySinh() != null && !Objects.equals(existing.getNgaySinh(), dto.getNgaySinh())) {
            existing.setNgaySinh(dto.getNgaySinh());
            changed = true;
        }
        if (dto.getGioiTinh() != null && !Objects.equals(existing.getGioiTinh(), dto.getGioiTinh())) {
            existing.setGioiTinh(dto.getGioiTinh());
            changed = true;
        }
        if (dto.getDanToc() != null && !Objects.equals(existing.getDanToc(), dto.getDanToc())) {
            existing.setDanToc(dto.getDanToc());
            changed = true;
        }
        if (dto.getQuocTich() != null && !Objects.equals(existing.getQuocTich(), dto.getQuocTich())) {
            existing.setQuocTich(dto.getQuocTich());
            changed = true;
        }
        if (dto.getNgheNghiep() != null && !Objects.equals(existing.getNgheNghiep(), dto.getNgheNghiep())) {
            existing.setNgheNghiep(dto.getNgheNghiep());
            changed = true;
        }
        if (dto.getCmndCccd() != null && !Objects.equals(existing.getCmndCccd(), dto.getCmndCccd())) {
            existing.setCmndCccd(dto.getCmndCccd());
            changed = true;
        }
        if (dto.getNgayCap() != null && !Objects.equals(existing.getNgayCap(), dto.getNgayCap())) {
            existing.setNgayCap(dto.getNgayCap());
            changed = true;
        }
        if (dto.getNoiCap() != null && !Objects.equals(existing.getNoiCap(), dto.getNoiCap())) {
            existing.setNoiCap(dto.getNoiCap());
            changed = true;
        }
        if (dto.getQuanHeChuHo() != null && !Objects.equals(existing.getQuanHeChuHo(), dto.getQuanHeChuHo())) {
            existing.setQuanHeChuHo(dto.getQuanHeChuHo());
            changed = true;
        }
        if (dto.getGhiChu() != null && !Objects.equals(existing.getGhiChu(), dto.getGhiChu())) {
            existing.setGhiChu(dto.getGhiChu());
            changed = true;
        }
        if (dto.getHoKhauId() != null && !Objects.equals(existing.getHoKhauId(), dto.getHoKhauId())) {
            existing.setHoKhauId(dto.getHoKhauId());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        NhanKhau saved = nhanKhauRepo.save(existing);
        
        // Publish event to trigger ThuPhiHoKhau recalculation
        log.info("Publishing NhanKhauChangedEvent for updated citizen: {} in household: {}", 
                 saved.getId(), saved.getHoKhauId());
        eventPublisher.publishEvent(new NhanKhauChangedEvent(this, saved.getId(), 
                                     saved.getHoKhauId(), ChangeOperation.UPDATE));
        
        return toResponseDTO(saved);
    }

    // Xóa nhân khẩu
    @Transactional
    public void delete(Long id, Authentication auth) {

        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
        
        Long hoKhauId = nk.getHoKhauId();
        
        // Publish event BEFORE deletion to trigger ThuPhiHoKhau recalculation
        log.info("Publishing NhanKhauChangedEvent for citizen deletion: {} in household: {}", id, hoKhauId);
        eventPublisher.publishEvent(new NhanKhauChangedEvent(this, id, hoKhauId, ChangeOperation.DELETE));
        
        nhanKhauRepo.delete(nk);
    }

    // --- TẠM TRÚ ---
    public NhanKhauResponseDto dangKyTamTru(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc()))
            throw new IllegalArgumentException("Ngày bắt đầu phải bé hơn ngày kết thúc");

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamTruTu(dto.getNgayBatDau());
        nk.setTamTruDen(dto.getNgayKetThuc());
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Tạm trú")
                .noiDung("Đăng ký tạm trú cho " + nk.getHoTen()
                        + " từ " + dto.getNgayBatDau()
                        + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
                        + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : ""))
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        NhanKhau saved = nhanKhauRepo.save(nk);
        return toResponseDTO(saved);
    }

    public void huyTamTru(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        existing.setTamTruTu(null);
        existing.setTamTruDen(null);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Hủy tạm trú")
                .noiDung("Hủy tạm trú cho " + existing.getHoTen())
                .thoiGian(LocalDateTime.now())
                .hoKhauId(existing.getHoKhauId())
                .nhanKhauId(existing.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        bienDongRepo.save(bd);
        nhanKhauRepo.save(existing);
    }


    // --- TẠM VẮNG ---
    public NhanKhauResponseDto dangKyTamVang(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc()))
            throw new IllegalArgumentException("Ngày bắt đầu phải bé hơn ngày kết thúc");

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamVangTu(dto.getNgayBatDau());
        nk.setTamVangDen(dto.getNgayKetThuc());
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Tạm trú")
                .noiDung("Đăng ký tạm vắng cho " + nk.getHoTen()
                        + " từ " + dto.getNgayBatDau()
                        + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
                        + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : ""))
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        NhanKhau saved = nhanKhauRepo.save(nk);
        
        // Publish event because tam_vang affects fee calculation
        log.info("Publishing NhanKhauChangedEvent for tam_vang registration: {} in household: {}", 
                 saved.getId(), saved.getHoKhauId());
        eventPublisher.publishEvent(new NhanKhauChangedEvent(this, saved.getId(), 
                                     saved.getHoKhauId(), ChangeOperation.UPDATE));
        
        return toResponseDTO(saved);
    }

    public void huyTamVang(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        existing.setTamVangTu(null);
        existing.setTamVangDen(null);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Kết thúc tạm vắng")
                .noiDung("Kết thúc tạm vắng cho " + existing.getHoTen())
                .thoiGian(LocalDateTime.now())
                .hoKhauId(existing.getHoKhauId())
                .nhanKhauId(existing.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        bienDongRepo.save(bd);
        nhanKhauRepo.save(existing);
        
        // Publish event because tam_vang affects fee calculation
        log.info("Publishing NhanKhauChangedEvent for tam_vang cancellation: {} in household: {}", 
                 existing.getId(), existing.getHoKhauId());
        eventPublisher.publishEvent(new NhanKhauChangedEvent(this, existing.getId(), 
                                     existing.getHoKhauId(), ChangeOperation.UPDATE));
    }

    // --- KHAI TỬ ---
    public NhanKhau khaiTu(Long id, String lyDo, Authentication auth) {
        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setGhiChu("Đã mất");
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Khai tử")
                .noiDung("Khai tử: " + nk.getHoTen() + (lyDo != null ? " - Lý do: " + lyDo : ""))
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        return nhanKhauRepo.save(nk);
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

    // Lấy tất cả nhân khẩu theo ID hộ khẩu (DTO)
    public List<NhanKhauResponseDto> getAllByHoKhauId(Long id) {
        if (id == null) {
            return java.util.Collections.emptyList();
        }

        List<NhanKhau> nhanKhaus = nhanKhauRepo.findByHoKhauId(id);
        return nhanKhaus.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // --- helper ---

    /**
     * Validate CCCD fields based on age
     * - If age < 14: all CCCD fields must be null/empty
     * - If age >= 14: all CCCD fields required, ngayCap must be >= ngaySinh + 14 years and <= today
     */
    private void validateCccdByAge(LocalDate ngaySinh, String cmndCccd, LocalDate ngayCap, String noiCap) {
        if (ngaySinh == null) {
            throw new IllegalArgumentException("Ngày sinh không được để trống");
        }

        LocalDate today = LocalDate.now();
        int age = java.time.Period.between(ngaySinh, today).getYears();
        
        boolean hasCccdData = (cmndCccd != null && !cmndCccd.trim().isEmpty()) ||
                              (ngayCap != null) ||
                              (noiCap != null && !noiCap.trim().isEmpty());

        if (age < 14) {
            // Under 14: CCCD fields must be empty
            if (hasCccdData) {
                throw new IllegalArgumentException(
                    "Người dưới 14 tuổi không được cấp CMND/CCCD. " +
                    "Vui lòng để trống các trường: CMND/CCCD, Ngày cấp, Nơi cấp"
                );
            }
        } else {
            // Age >= 14: All CCCD fields required
            if (cmndCccd == null || cmndCccd.trim().isEmpty()) {
                throw new IllegalArgumentException("Người từ 14 tuổi trở lên phải có CMND/CCCD");
            }
            if (ngayCap == null) {
                throw new IllegalArgumentException("Người từ 14 tuổi trở lên phải có ngày cấp CMND/CCCD");
            }
            if (noiCap == null || noiCap.trim().isEmpty()) {
                throw new IllegalArgumentException("Người từ 14 tuổi trở lên phải có nơi cấp CMND/CCCD");
            }
            
            // Validate CMND/CCCD format (9-12 digits)
            if (!cmndCccd.matches("\\d{9,12}")) {
                throw new IllegalArgumentException("CMND/CCCD phải có 9-12 chữ số");
            }
            
            // Validate ngayCap >= ngaySinh + 14 years
            LocalDate minIssuanceDate = ngaySinh.plusYears(14);
            if (ngayCap.isBefore(minIssuanceDate)) {
                throw new IllegalArgumentException(
                    "Ngày cấp CMND/CCCD phải sau ngày sinh ít nhất 14 năm (từ " + 
                    minIssuanceDate + " trở đi)"
                );
            }
            
            // Validate ngayCap <= today
            if (ngayCap.isAfter(today)) {
                throw new IllegalArgumentException("Ngày cấp CMND/CCCD không được là ngày trong tương lai");
            }
        }
    }

    // Mapper: Entity -> Response DTO
    private NhanKhauResponseDto toResponseDTO(NhanKhau nk) {
        // Compute current status based on tam_vang/tam_tru dates
        LocalDate now = LocalDate.now();
        String trangThaiHienTai = "THUONG_TRU"; // default
        
        // Check tam_vang first (higher priority)
        if (nk.getTamVangTu() != null && 
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
                .createdBy(nk.getCreatedBy())
                .updatedBy(nk.getUpdatedBy())
                .createdAt(nk.getCreatedAt())
                .updatedAt(nk.getUpdatedAt())
                .build();
    }
}
