package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.ThuPhiHoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.ThuPhiHoKhauResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.entity.ThuPhiHoKhau;
import com.example.QuanLyDanCu.repository.DotThuPhiRepository;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.repository.ThuPhiHoKhauRepository;
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
public class ThuPhiHoKhauService {

    private final ThuPhiHoKhauRepository repo;
    private final HoKhauRepository hoKhauRepo;
    private final DotThuPhiRepository dotThuPhiRepo;
    private final TaiKhoanRepository taiKhoanRepo;

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

    // Thêm thu phí mới
    @Transactional
    public ThuPhiHoKhauResponseDto create(ThuPhiHoKhauRequestDto dto, Authentication auth) {
        checkPermission(auth);

        HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));

        DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));

        TaiKhoan user = getCurrentUser(auth);

        ThuPhiHoKhau entity = ThuPhiHoKhau.builder()
                .hoKhau(hoKhau)
                .dotThuPhi(dotThuPhi)
                .soTienDaThu(dto.getSoTienDaThu())
                .ngayThu(dto.getNgayThu())
                .months(dto.getMonths())
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

        if (dto.getHoKhauId() != null && !dto.getHoKhauId().equals(existing.getHoKhau().getId())) {
            HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));
            existing.setHoKhau(hoKhau);
        }

        if (dto.getDotThuPhiId() != null && !dto.getDotThuPhiId().equals(existing.getDotThuPhi().getId())) {
            DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + dto.getDotThuPhiId()));
            existing.setDotThuPhi(dotThuPhi);
        }

        existing.setSoTienDaThu(dto.getSoTienDaThu());
        existing.setNgayThu(dto.getNgayThu());
        existing.setMonths(dto.getMonths());
        existing.setGhiChu(dto.getGhiChu());

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
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_TOTRUONG")) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này!");
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
                .soTienDaThu(entity.getSoTienDaThu())
                .ngayThu(entity.getNgayThu())
                .months(entity.getMonths())
                .ghiChu(entity.getGhiChu())
                .collectedBy(entity.getCollectedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
