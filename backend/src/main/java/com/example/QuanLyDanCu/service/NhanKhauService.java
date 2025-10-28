package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NhanKhauService {

    private final NhanKhauRepository nhanKhauRepo;
    private final BienDongRepository bienDongRepo;
    private final TaiKhoanRepository taiKhoanRepo;

    // Lấy tất cả nhân khẩu
    public List<NhanKhau> getAll() {
        return nhanKhauRepo.findAll();
    }

    // Lấy nhân khẩu theo id
    public NhanKhau getById(Long id) {
        return nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
    }

    // Thêm nhân khẩu mới
    public NhanKhau create(NhanKhau nk, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thêm nhân khẩu!");
        }

        // Lấy ID người hiện tại từ Authentication
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        nk.setCreatedAt(LocalDateTime.now()); // timestamp hệ thống
        nk.setCreatedBy(user.getId());        // ID người tạo
        nk.setUpdatedAt(LocalDateTime.now()); // timestamp hệ thống
        nk.setUpdatedBy(user.getId());

        return nhanKhauRepo.save(nk);
    }

    // Cập nhật nhân khẩu
    public NhanKhau update(Long id, NhanKhau nk, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền sửa nhân khẩu!");
        }

        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        boolean changed = false;

        // --- Cập nhật thông tin nhân khẩu ---
        if (nk.getHoTen() != null && !Objects.equals(existing.getHoTen(), nk.getHoTen())) {
            existing.setHoTen(nk.getHoTen());
            changed = true;
        }

        if (nk.getNgaySinh() != null && !Objects.equals(existing.getNgaySinh(), nk.getNgaySinh())) {
            existing.setNgaySinh(nk.getNgaySinh());
            changed = true;
        }

        if (nk.getGioiTinh() != null && !Objects.equals(existing.getGioiTinh(), nk.getGioiTinh())) {
            existing.setGioiTinh(nk.getGioiTinh());
            changed = true;
        }

        // Nếu không có gì thay đổi
        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        existing.setUpdatedAt(LocalDateTime.now()); // timestamp update
        existing.setUpdatedBy(user.getId());        // ID người sửa

        return nhanKhauRepo.save(existing);
    }

    // Xóa nhân khẩu
    public void delete(Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền xóa nhân khẩu!");
        }

        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu id = " + id));
        nhanKhauRepo.delete(nk);
    }
    // --- TẠM TRÚ ---
    public NhanKhau dangKyTamTru(Long id, LocalDate tu, LocalDate den, String lyDo, Authentication auth) {
        checkRole(auth);
        if (tu == null) throw new RuntimeException("Ngày bắt đầu tạm trú (tu) không được để trống");

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamTruTu(tu);
        nk.setTamTruDen(den);
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Tạm trú")
                .noiDung("Đăng ký tạm trú cho " + nk.getHoTen()
                        + " từ " + tu
                        + (den != null ? " đến " + den : "")
                        + (lyDo != null ? " - Lý do: " + lyDo : ""))
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        return nhanKhauRepo.save(nk);
    }

    public NhanKhau huyTamTru(Long id, Authentication auth) {
        checkRole(auth);

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamTruTu(null);
        nk.setTamTruDen(null);
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Hủy tạm trú")
                .noiDung("Hủy tạm trú cho " + nk.getHoTen())
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        return nhanKhauRepo.save(nk);
    }

    // --- TẠM VẮNG ---
    public NhanKhau dangKyTamVang(Long id, LocalDate tu, LocalDate den, String lyDo, Authentication auth) {
        checkRole(auth);
        if (tu == null) throw new RuntimeException("Ngày bắt đầu tạm vắng (tu) không được để trống");

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamVangTu(tu);
        nk.setTamVangDen(den);
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Tạm vắng")
                .noiDung("Đăng ký tạm vắng cho " + nk.getHoTen()
                        + " từ " + tu
                        + (den != null ? " đến " + den : "")
                        + (lyDo != null ? " - Lý do: " + lyDo : ""))
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        return nhanKhauRepo.save(nk);
    }

    public NhanKhau huyTamVang(Long id, Authentication auth) {
        checkRole(auth);

        NhanKhau nk = nhanKhauRepo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu"));
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        nk.setTamVangTu(null);
        nk.setTamVangDen(null);
        nk.setUpdatedAt(LocalDateTime.now());
        nk.setUpdatedBy(user.getId());

        BienDong bd = BienDong.builder()
                .loai("Kết thúc tạm vắng")
                .noiDung("Kết thúc tạm vắng cho " + nk.getHoTen())
                .thoiGian(LocalDateTime.now())
                .hoKhauId(nk.getHoKhauId())
                .nhanKhauId(nk.getId())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        bienDongRepo.save(bd);

        return nhanKhauRepo.save(nk);
    }

    // --- KHAI TỬ ---
    public NhanKhau khaiTu(Long id, String lyDo, Authentication auth) {
        checkRole(auth);

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

    // --- helper ---
    private void checkRole(Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này!");
        }
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

}
