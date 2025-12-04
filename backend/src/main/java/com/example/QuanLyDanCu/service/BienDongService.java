package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
import com.example.QuanLyDanCu.entity.BienDong;
import com.example.QuanLyDanCu.enums.BienDongType;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.BienDongRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            .orElseThrow(() -> new NotFoundException("Không tìm thấy biến động với id = " + id));
        return toResponseDto(entity);
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
