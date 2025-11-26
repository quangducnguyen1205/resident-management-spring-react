package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.BienDongRequestDto;
import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BienDongService {

        private static final List<String> ALLOWED_TYPE_VALUES = List.of(
            "CHUYEN_DEN",
            "CHUYEN_DI",
            "TACH_HO",
            "NHAP_HO",
            "KHAI_TU",
            "SINH",
            "THAY_DOI_THONG_TIN"
        );

        private static final Set<String> ALLOWED_TYPES = Set.copyOf(ALLOWED_TYPE_VALUES);

    private final BienDongRepository bienDongRepository;

    public List<BienDongResponseDto> getAllDto() {
        return bienDongRepository.findAll(Sort.by(Sort.Direction.DESC, "thoiGian"))
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public BienDongResponseDto getByIdDto(Long id) {
        BienDong entity = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));
        return toResponseDto(entity);
    }

    public BienDongResponseDto createDto(BienDongRequestDto dto, Authentication auth) {
        validateLoaiBienDong(dto.getLoai());

        LocalDateTime now = LocalDateTime.now();
        BienDong entity = BienDong.builder()
                .loai(dto.getLoai().toUpperCase())
                .noiDung(dto.getNoiDung())
                .thoiGian(dto.getThoiGian() != null ? dto.getThoiGian() : now)
                .hoKhauId(dto.getHoKhauId())
                .nhanKhauId(dto.getNhanKhauId())
                .build();

        BienDong saved = bienDongRepository.save(entity);
        return toResponseDto(saved);
    }

    public BienDongResponseDto updateDto(Long id, BienDongRequestDto dto, Authentication auth) {
        BienDong existing = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));

        if (dto.getHoKhauId() != null && !Objects.equals(dto.getHoKhauId(), existing.getHoKhauId())) {
            throw new RuntimeException("Không được thay đổi ho_khau_id");
        }
        if (dto.getNhanKhauId() != null && !Objects.equals(dto.getNhanKhauId(), existing.getNhanKhauId())) {
            throw new RuntimeException("Không được thay đổi nhan_khau_id");
        }

        boolean changed = false;

        if (dto.getLoai() != null && !dto.getLoai().isBlank() &&
                !Objects.equals(existing.getLoai(), dto.getLoai().toUpperCase())) {
            validateLoaiBienDong(dto.getLoai());
            existing.setLoai(dto.getLoai().toUpperCase());
            changed = true;
        }

        if (dto.getNoiDung() != null && !Objects.equals(existing.getNoiDung(), dto.getNoiDung())) {
            existing.setNoiDung(dto.getNoiDung());
            changed = true;
        }

        if (dto.getThoiGian() != null && !Objects.equals(existing.getThoiGian(), dto.getThoiGian())) {
            existing.setThoiGian(dto.getThoiGian());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì để cập nhật");
        }

        BienDong saved = bienDongRepository.save(existing);
        return toResponseDto(saved);
    }

    public void delete(Long id, Authentication auth) {
        BienDong entity = bienDongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến động với id = " + id));
        bienDongRepository.delete(entity);
    }

    private BienDongResponseDto toResponseDto(BienDong entity) {
        return BienDongResponseDto.builder()
                .id(entity.getId())
                .loai(entity.getLoai())
                .noiDung(entity.getNoiDung())
                .thoiGian(entity.getThoiGian())
                .hoKhauId(entity.getHoKhauId())
                .nhanKhauId(entity.getNhanKhauId())
                .build();
    }

    private void validateLoaiBienDong(String loai) {
        if (loai == null || !ALLOWED_TYPES.contains(loai.toUpperCase())) {
            throw new RuntimeException("Loại biến động không hợp lệ. Cho phép: " + String.join(", ", ALLOWED_TYPE_VALUES));
        }
    }
}
