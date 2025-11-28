package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.BienDongRequestDto;
import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.enums.BienDongType;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BienDongService {

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
        BienDong entity = BienDong.builder()
                .loai(dto.toBienDongType())
                .noiDung(dto.getNoiDung())
                .thoiGian(dto.getThoiGian() != null ? dto.getThoiGian() : LocalDateTime.now())
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

        if (dto.getLoai() != null && !dto.getLoai().isBlank()) {
            BienDongType newType = BienDongType.fromString(dto.getLoai());
            if (existing.getLoai() != newType) {
                existing.setLoai(newType);
                changed = true;
            }
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

    @Transactional
    public BienDong log(BienDongType type, String noiDung, Long hoKhauId, Long nhanKhauId) {
        BienDong entity = BienDong.builder()
                .loai(type)
                .noiDung(noiDung)
                .thoiGian(LocalDateTime.now())
                .hoKhauId(hoKhauId)
                .nhanKhauId(nhanKhauId)
                .build();
        return bienDongRepository.save(entity);
    }

    private BienDongResponseDto toResponseDto(BienDong entity) {
        return BienDongResponseDto.builder()
                .id(entity.getId())
                .loai(entity.getLoai() != null ? entity.getLoai().name() : null)
                .noiDung(entity.getNoiDung())
                .thoiGian(entity.getThoiGian())
                .hoKhauId(entity.getHoKhauId())
                .nhanKhauId(entity.getNhanKhauId())
                .build();
    }
}
