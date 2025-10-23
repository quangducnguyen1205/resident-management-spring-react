package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HoKhauService {

    private final HoKhauRepository repo;
    private final TaiKhoanRepository taiKhoanRepo;

    // Lấy tất cả hộ khẩu
    public List<HoKhau> getAll() {
        return repo.findAll();
    }

    // Lấy hộ khẩu theo id
    public HoKhau getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
    }

    // Thêm hộ khẩu mới
    public HoKhau create(HoKhau hk, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TO_TRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thêm hộ khẩu!");
        }

        // Lấy ID người hiện tại từ Authentication
        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        hk.setNgayTao(LocalDate.now());          // ngày hành chính tạo hộ khẩu
        hk.setCreatedAt(LocalDateTime.now());    // timestamp hệ thống
        hk.setCreatedBy(user.getId());           // ID người tạo

        return repo.save(hk);
    }

    // Cập nhật hộ khẩu
    public HoKhau update(Long id, HoKhau hk, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TO_TRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền sửa hộ khẩu!");
        }

        HoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        existing.setTenChuHo(hk.getTenChuHo());
        existing.setDiaChi(hk.getDiaChi());
        existing.setPhuongXa(hk.getPhuongXa());
        existing.setQuanHuyen(hk.getQuanHuyen());
        existing.setNoiDungThayDoiChuHo(hk.getNoiDungThayDoiChuHo());
        existing.setNgayThayDoiChuHo(hk.getNgayThayDoiChuHo());

        existing.setUpdatedAt(LocalDateTime.now()); // timestamp update
        existing.setUpdatedBy(user.getId());        // ID người sửa

        return repo.save(existing);
    }

    // Xóa hộ khẩu
    public void delete(Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TO_TRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền xóa hộ khẩu!");
        }

        HoKhau hk = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
        repo.delete(hk);
    }
}
