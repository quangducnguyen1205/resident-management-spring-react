package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.BienDongRequestDto;
import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BienDongService {

    private final BienDongRepository bienDongRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    // ========== DTO-based methods ==========

    // Lấy tất cả biến động (DTO)
    public List<BienDongResponseDto> getAllDto() {
        return bienDongRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy biến động theo ID (DTO)
    public BienDongResponseDto getByIdDto(Long id) {
        BienDong bd = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));
        return toResponseDto(bd);
    }

    // Tạo mới biến động (DTO)
    public BienDongResponseDto createDto(BienDongRequestDto dto, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new RuntimeException("Bạn không có quyền tạo biến động!");
        }

        TaiKhoan user = taiKhoanRepository.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        BienDong bienDong = BienDong.builder()
                .loai(dto.getLoai())
                .noiDung(dto.getNoiDung())
                .thoiGian(dto.getThoiGian() != null ? dto.getThoiGian() : LocalDateTime.now())
                .hoKhauId(dto.getHoKhauId())
                .nhanKhauId(dto.getNhanKhauId())
                .createdAt(LocalDateTime.now())
                .createdBy(user.getId())
                .build();

        BienDong saved = bienDongRepository.save(bienDong);
        return toResponseDto(saved);
    }

    // Cập nhật biến động (DTO)
    public BienDongResponseDto updateDto(Long id, BienDongRequestDto dto, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new RuntimeException("Bạn không có quyền sửa biến động!");
        }

        BienDong existing = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));

        boolean changed = false;

        // Kiểm tra và cập nhật loại biến động
        if (dto.getLoai() != null && !Objects.equals(existing.getLoai(), dto.getLoai())) {
            existing.setLoai(dto.getLoai());
            changed = true;
        }

        // Kiểm tra và cập nhật nội dung
        if (dto.getNoiDung() != null && !Objects.equals(existing.getNoiDung(), dto.getNoiDung())) {
            existing.setNoiDung(dto.getNoiDung());
            changed = true;
        }

        // Kiểm tra và cập nhật thời gian
        if (dto.getThoiGian() != null && !Objects.equals(existing.getThoiGian(), dto.getThoiGian())) {
            existing.setThoiGian(dto.getThoiGian());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì thay đổi!");
        }

        // Gán thông tin cập nhật
        TaiKhoan user = taiKhoanRepository.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        existing.setCreatedAt(LocalDateTime.now());  // Thời gian cập nhật
        existing.setCreatedBy(user.getId());  // Lấy ID người sửa

        BienDong saved = bienDongRepository.save(existing);
        return toResponseDto(saved);
    }

    // Mapper: Entity -> Response DTO
    private BienDongResponseDto toResponseDto(BienDong bd) {
        return BienDongResponseDto.builder()
                .id(bd.getId())
                .loai(bd.getLoai())
                .noiDung(bd.getNoiDung())
                .thoiGian(bd.getThoiGian())
                .hoKhauId(bd.getHoKhauId())
                .nhanKhauId(bd.getNhanKhauId())
                .createdBy(bd.getCreatedBy())
                .createdAt(bd.getCreatedAt())
                .build();
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
