package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
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
}
