package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DotThuPhiRequestDto;
import com.example.QuanLyDanCu.dto.response.DotThuPhiResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.enums.LoaiThuPhi;
import com.example.QuanLyDanCu.exception.BadRequestException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.DotThuPhiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DotThuPhiService {

    private final DotThuPhiRepository repo;

    // Lấy tất cả đợt thu phí
    public List<DotThuPhiResponseDto> getAll() {
        return repo.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    // Lấy đợt thu phí theo id
    public DotThuPhiResponseDto getById(Long id) {
        DotThuPhi entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đợt thu phí id = " + id));
        return toResponseDto(entity);
    }

    // Thêm đợt thu phí mới
    @Transactional
    public DotThuPhiResponseDto create(DotThuPhiRequestDto dto, Authentication auth) {
        // Validate date range: ngayKetThuc must be >= ngayBatDau
        if (dto.getNgayKetThuc().isBefore(dto.getNgayBatDau())) {
            throw new BadRequestException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }

        // Validate dinhMuc based on loai
        BigDecimal dinhMuc = dto.getDinhMuc();
        if (dto.getLoai() == LoaiThuPhi.BAT_BUOC) {
            if (dinhMuc == null || dinhMuc.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Định mức phải là số dương cho phí bắt buộc");
            }
        } else if (dto.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            // Tự nguyện: định mức luôn = 0, nếu nhập khác 0 → báo lỗi
            if (dinhMuc == null) {
                dinhMuc = BigDecimal.ZERO; // tự set = 0 nếu client không gửi
            } else if (dinhMuc.compareTo(BigDecimal.ZERO) != 0) {
                throw new BadRequestException("Định mức cho phí tự nguyện phải bằng 0");
            }
        }

        DotThuPhi entity = DotThuPhi.builder()
                .tenDot(dto.getTenDot())
                .loai(dto.getLoai())
                .ngayBatDau(dto.getNgayBatDau())
                .ngayKetThuc(dto.getNgayKetThuc())
                .ngayKetThuc(dto.getNgayKetThuc())
                .dinhMuc(dinhMuc)
                .thuTheoDot(dto.getThuTheoDot())
                .build();

        DotThuPhi saved = repo.save(entity);
        return toResponseDto(saved);
    }

    // Xóa đợt thu phí
    @Transactional
    public void delete(Long id, Authentication auth) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Không tìm thấy đợt thu phí id = " + id);
        }
        repo.deleteById(id);
    }

    private DotThuPhiResponseDto toResponseDto(DotThuPhi entity) {
        return DotThuPhiResponseDto.builder()
                .id(entity.getId())
                .tenDot(entity.getTenDot())
                .loai(entity.getLoai())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .ngayKetThuc(entity.getNgayKetThuc())
                .dinhMuc(entity.getDinhMuc())
                .thuTheoDot(entity.getThuTheoDot())
                .build();
    }

    @jakarta.annotation.PostConstruct
    public void initSanitationFee() {
        int currentYear = java.time.LocalDate.now().getYear();
        String feeName = "Khoản phí vệ sinh năm " + currentYear;

        if (!repo.existsByTenDot(feeName)) {
            log.info("Creating default sanitation fee for year {}", currentYear);
            DotThuPhi fee = DotThuPhi.builder()
                    .tenDot(feeName)
                    .loai(LoaiThuPhi.BAT_BUOC)
                    .ngayBatDau(java.time.LocalDate.of(currentYear, 1, 1))
                    .ngayKetThuc(java.time.LocalDate.of(currentYear, 12, 31))
                    .dinhMuc(new BigDecimal("72000"))
                    .thuTheoDot(true)
                    .build();
            repo.save(fee);
        }
    }
}
