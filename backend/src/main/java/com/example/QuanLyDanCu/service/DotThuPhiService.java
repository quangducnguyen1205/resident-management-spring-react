package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DotThuPhiRequestDto;
import com.example.QuanLyDanCu.dto.response.DotThuPhiResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.repository.DotThuPhiRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DotThuPhiService {

    private final DotThuPhiRepository repo;
    private final TaiKhoanRepository taiKhoanRepo;

    // Lấy tất cả đợt thu phí
    public List<DotThuPhiResponseDto> getAll() {
        return repo.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy đợt thu phí theo id
    public DotThuPhiResponseDto getById(Long id) {
        DotThuPhi entity = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + id));
        return toResponseDto(entity);
    }

    // Thêm đợt thu phí mới
    @Transactional
    public DotThuPhiResponseDto create(DotThuPhiRequestDto dto, Authentication auth) {
        checkPermission(auth);
        
        TaiKhoan user = getCurrentUser(auth);

        DotThuPhi entity = DotThuPhi.builder()
                .tenDot(dto.getTenDot())
                .loai(dto.getLoai())
                .ngayBatDau(dto.getNgayBatDau())
                .ngayKetThuc(dto.getNgayKetThuc())
                .dinhMuc(dto.getDinhMuc())
                .createdBy(user.getId())
                .createdAt(LocalDateTime.now())
                .build();

        DotThuPhi saved = repo.save(entity);
        return toResponseDto(saved);
    }

    // Cập nhật đợt thu phí
    @Transactional
    public DotThuPhiResponseDto update(Long id, DotThuPhiRequestDto dto, Authentication auth) {
        checkPermission(auth);

        DotThuPhi existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + id));

        existing.setTenDot(dto.getTenDot());
        existing.setLoai(dto.getLoai());
        existing.setNgayBatDau(dto.getNgayBatDau());
        existing.setNgayKetThuc(dto.getNgayKetThuc());
        existing.setDinhMuc(dto.getDinhMuc());
        existing.setUpdatedAt(LocalDateTime.now());

        DotThuPhi updated = repo.save(existing);
        return toResponseDto(updated);
    }

    // Xóa đợt thu phí
    @Transactional
    public void delete(Long id, Authentication auth) {
        checkPermission(auth);

        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đợt thu phí id = " + id);
        }
        repo.deleteById(id);
    }

    // Helper methods
    private void checkPermission(Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        if (!role.equals("ADMIN") && !role.equals("TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này!");
        }
    }

    private TaiKhoan getCurrentUser(Authentication auth) {
        return taiKhoanRepo.findByTenDangNhap(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }

    private DotThuPhiResponseDto toResponseDto(DotThuPhi entity) {
        return DotThuPhiResponseDto.builder()
                .id(entity.getId())
                .tenDot(entity.getTenDot())
                .loai(entity.getLoai())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .dinhMuc(entity.getDinhMuc())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
