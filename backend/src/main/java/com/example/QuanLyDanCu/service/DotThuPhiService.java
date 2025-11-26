package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DotThuPhiRequestDto;
import com.example.QuanLyDanCu.dto.request.DotThuPhiUpdateDto;
import com.example.QuanLyDanCu.dto.response.DotThuPhiResponseDto;
import com.example.QuanLyDanCu.entity.DotThuPhi;
import com.example.QuanLyDanCu.enums.LoaiThuPhi;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + id));
        return toResponseDto(entity);
    }

    // Thêm đợt thu phí mới
    @Transactional
    public DotThuPhiResponseDto create(DotThuPhiRequestDto dto, Authentication auth) {
        // Validate date range: ngayKetThuc must be >= ngayBatDau
        if (dto.getNgayKetThuc().isBefore(dto.getNgayBatDau())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }
        
        // Validate dinhMuc based on loai
        BigDecimal dinhMuc = dto.getDinhMuc();
        if (dto.getLoai() == LoaiThuPhi.BAT_BUOC) {
            if (dinhMuc == null || dinhMuc.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Định mức phải là số dương cho phí bắt buộc");
            }
        } else if (dto.getLoai() == LoaiThuPhi.TU_NGUYEN) {
            // For voluntary fees, default to 0 if not provided
            if (dinhMuc == null) {
                dinhMuc = BigDecimal.ZERO;
            }
        }
        
        DotThuPhi entity = DotThuPhi.builder()
                .tenDot(dto.getTenDot())
                .loai(dto.getLoai())
                .ngayBatDau(dto.getNgayBatDau())
                .ngayKetThuc(dto.getNgayKetThuc())
            .dinhMuc(dinhMuc)
                .build();

        DotThuPhi saved = repo.save(entity);
        return toResponseDto(saved);
    }

    // Cập nhật đợt thu phí - PARTIAL UPDATE SUPPORT
    @Transactional
    public DotThuPhiResponseDto update(Long id, DotThuPhiUpdateDto dto, Authentication auth) {
        DotThuPhi existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí id = " + id));

        boolean changed = false;

        // Update tenDot (only if provided)
        if (dto.getTenDot() != null) {
            existing.setTenDot(dto.getTenDot());
            changed = true;
        }

        // Update loai (only if provided)
        if (dto.getLoai() != null) {
            existing.setLoai(dto.getLoai());
            changed = true;
        }

        // Update ngayBatDau (only if provided)
        if (dto.getNgayBatDau() != null) {
            existing.setNgayBatDau(dto.getNgayBatDau());
            changed = true;
        }

        // Update ngayKetThuc (only if provided)
        if (dto.getNgayKetThuc() != null) {
            existing.setNgayKetThuc(dto.getNgayKetThuc());
            changed = true;
        }

        // Update dinhMuc with validation (only if provided)
        if (dto.getDinhMuc() != null) {
            // Check loai to validate dinhMuc
            LoaiThuPhi loai = dto.getLoai() != null ? dto.getLoai() : existing.getLoai();
            if (loai == LoaiThuPhi.BAT_BUOC && dto.getDinhMuc().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Định mức phải là số dương cho phí bắt buộc");
            }
            existing.setDinhMuc(dto.getDinhMuc());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        DotThuPhi updated = repo.save(existing);
        return toResponseDto(updated);
    }

    // Xóa đợt thu phí
    @Transactional
    public void delete(Long id, Authentication auth) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đợt thu phí id = " + id);
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
            .dinhMuc(entity.getDinhMuc())
                .build();
    }
}
