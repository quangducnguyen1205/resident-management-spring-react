package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.HoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.HoKhauResponseDto;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoKhauService {

    private final HoKhauRepository repo;
    private final TaiKhoanRepository taiKhoanRepo;

    // ========== DTO-based methods ==========

    // Lấy tất cả hộ khẩu (DTO)
    public List<HoKhauResponseDto> getAll() {
        return repo.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy hộ khẩu theo id (DTO)
    public HoKhauResponseDto getById(Long id) {
        HoKhau hk = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
        return toResponseDto(hk);
    }

    // Thêm hộ khẩu mới (DTO)
    public HoKhauResponseDto create(HoKhauRequestDto dto, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thêm hộ khẩu!");
        }

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        HoKhau hk = HoKhau.builder()
                .soHoKhau(dto.getSoHoKhau())
                .tenChuHo(dto.getTenChuHo())
                .diaChi(dto.getDiaChi())
                .ngayTao(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .createdBy(user.getId())
                .build();

        HoKhau saved = repo.save(hk);
        return toResponseDto(saved);
    }

    // Cập nhật hộ khẩu (DTO)
    public HoKhauResponseDto update(Long id, HoKhauRequestDto dto, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền sửa hộ khẩu!");
        }

        HoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));

        TaiKhoan user = taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        
        boolean changed = false;

        // Cập nhật tên chủ hộ
        if (dto.getTenChuHo() != null && !Objects.equals(existing.getTenChuHo(), dto.getTenChuHo())) {
            if (dto.getNoiDungThayDoiChuHo() == null || dto.getNoiDungThayDoiChuHo().trim().isEmpty()) {
                throw new RuntimeException("Bạn phải nhập nội dung thay đổi chủ hộ!");
            }
            existing.setTenChuHo(dto.getTenChuHo());
            existing.setNoiDungThayDoiChuHo(dto.getNoiDungThayDoiChuHo());
            existing.setNgayThayDoiChuHo(LocalDate.now());
            changed = true;
        }

        // Cập nhật địa chỉ
        if (dto.getDiaChi() != null && !Objects.equals(existing.getDiaChi(), dto.getDiaChi())) {
            existing.setDiaChi(dto.getDiaChi());
            changed = true;
        }

        // Cập nhật số hộ khẩu
        if (dto.getSoHoKhau() != null && !Objects.equals(existing.getSoHoKhau(), dto.getSoHoKhau())) {
            existing.setSoHoKhau(dto.getSoHoKhau());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(user.getId());

        HoKhau saved = repo.save(existing);
        return toResponseDto(saved);
    }

    // Mapper: Entity -> Response DTO
    private HoKhauResponseDto toResponseDto(HoKhau hk) {
        return HoKhauResponseDto.builder()
                .id(hk.getId())
                .soHoKhau(hk.getSoHoKhau())
                .tenChuHo(hk.getTenChuHo())
                .diaChi(hk.getDiaChi())
                .ngayTao(hk.getNgayTao())
                .noiDungThayDoiChuHo(hk.getNoiDungThayDoiChuHo())
                .ngayThayDoiChuHo(hk.getNgayThayDoiChuHo())
                .createdBy(hk.getCreatedBy())
                .updatedBy(hk.getUpdatedBy())
                                .createdAt(hk.getCreatedAt())
                .updatedAt(hk.getUpdatedAt())
                .build();
    }

    // Xóa hộ khẩu
    public void delete(Long id, Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền xóa hộ khẩu!");
        }

        HoKhau hk = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
        repo.delete(hk);
    }
}
