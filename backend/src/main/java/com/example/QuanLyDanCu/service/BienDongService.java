package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BienDongService {

    private final BienDongRepository bienDongRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    // Lấy tất cả biến động
    public List<BienDong> getAll() {
        return bienDongRepository.findAll(); // Lấy tất cả biến động từ cơ sở dữ liệu
    }

    // Tạo mới biến động
    public BienDong create(BienDong bienDong, Authentication auth) {
        // Kiểm tra quyền người dùng
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new RuntimeException("Bạn không có quyền tạo biến động!");
        }

        // Lấy thông tin người dùng từ Authentication
        TaiKhoan user = taiKhoanRepository.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        bienDong.setCreatedAt(LocalDateTime.now()); // Gán thời gian tạo
        bienDong.setCreatedBy(user.getId());        // Gán ID người tạo

        return bienDongRepository.save(bienDong);  // Lưu biến động vào cơ sở dữ liệu
    }

    // Cập nhật biến động
    public BienDong update(Long id, BienDong bienDong, Authentication auth) {
        // Kiểm tra quyền người dùng
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new RuntimeException("Bạn không có quyền sửa biến động!");
        }

        // Lấy biến động hiện tại từ cơ sở dữ liệu
        BienDong existingBienDong = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));

        boolean changed = false;

        // Kiểm tra và cập nhật loại biến động
        if (bienDong.getLoai() != null && !Objects.equals(existingBienDong.getLoai(), bienDong.getLoai())) {
            existingBienDong.setLoai(bienDong.getLoai());
            changed = true;
        }

        // Kiểm tra và cập nhật nội dung biến động
        if (bienDong.getNoiDung() != null && !Objects.equals(existingBienDong.getNoiDung(), bienDong.getNoiDung())) {
            existingBienDong.setNoiDung(bienDong.getNoiDung());
            changed = true;
        }

        // Nếu không có sự thay đổi, throw lỗi
        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        // Gán thông tin cập nhật
        existingBienDong.setCreatedAt(LocalDateTime.now());  // Thời gian cập nhật
        existingBienDong.setCreatedBy(Long.valueOf(auth.getName()));  // Lấy ID người sửa từ tên đăng nhập

        return bienDongRepository.save(existingBienDong); // Lưu lại biến động đã cập nhật
    }

    // Xóa biến động
    public void delete(Long id, Authentication auth) {
        // Kiểm tra quyền người dùng
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new RuntimeException("Bạn không có quyền xóa biến động!");
        }

        // Lấy biến động từ cơ sở dữ liệu và xóa
        BienDong bienDong = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));

        bienDongRepository.delete(bienDong);  // Xóa biến động khỏi cơ sở dữ liệu
    }
}
