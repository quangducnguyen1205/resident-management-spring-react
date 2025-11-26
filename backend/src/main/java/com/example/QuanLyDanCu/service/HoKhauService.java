package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.HoKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.HoKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.HoKhauResponseDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.event.ChangeOperation;
import com.example.QuanLyDanCu.event.HoKhauChangedEvent;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HoKhauService {

    private final HoKhauRepository repo;
    private final NhanKhauService nhanKhauService;
    private final ApplicationEventPublisher eventPublisher;

    // ========== DTO-based methods ==========

    // Lấy tất cả hộ khẩu (DTO) - ordered by soHoKhau for stable UI display
    public List<HoKhauResponseDto> getAll() {
        return repo.findAll().stream()
                .sorted((h1, h2) -> {
                    // Sort by soHoKhau (stable natural key)
                    if (h1.getSoHoKhau() == null) return 1;
                    if (h2.getSoHoKhau() == null) return -1;
                    return h1.getSoHoKhau().compareTo(h2.getSoHoKhau());
                })
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
    @Transactional
    public HoKhauResponseDto create(HoKhauRequestDto dto, Authentication auth) {
        HoKhau hk = HoKhau.builder()
                .soHoKhau(dto.getSoHoKhau())
                .tenChuHo(dto.getTenChuHo())
                .diaChi(dto.getDiaChi())
            .ngayTao(LocalDate.now())
                .build();

        HoKhau saved = repo.save(hk);
        
        // Publish event to trigger ThuPhiHoKhau creation
        log.info("Publishing HoKhauChangedEvent for newly created household: {}", saved.getId());
        eventPublisher.publishEvent(new HoKhauChangedEvent(this, saved.getId(), ChangeOperation.CREATE));
        
        return toResponseDto(saved);
    }

    // Cập nhật hộ khẩu (DTO) - PARTIAL UPDATE SUPPORT
    // Note: soHoKhau is immutable and cannot be updated
    @Transactional
    public HoKhauResponseDto update(Long id, HoKhauUpdateDto dto, Authentication auth) {
        HoKhau existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
        
        boolean changed = false;

        // Cập nhật tên chủ hộ (only if provided)
        if (dto.getTenChuHo() != null && !Objects.equals(existing.getTenChuHo(), dto.getTenChuHo())) {
            existing.setTenChuHo(dto.getTenChuHo());
            changed = true;
        }

        // Cập nhật địa chỉ (only if provided)
        if (dto.getDiaChi() != null && !Objects.equals(existing.getDiaChi(), dto.getDiaChi())) {
            existing.setDiaChi(dto.getDiaChi());
            changed = true;
        }

        if (!changed) {
            throw new RuntimeException("Không có gì để thay đổi!");
        }

        HoKhau saved = repo.save(existing);
        
        // Publish event to trigger ThuPhiHoKhau recalculation
        log.info("Publishing HoKhauChangedEvent for updated household: {}", saved.getId());
        eventPublisher.publishEvent(new HoKhauChangedEvent(this, saved.getId(), ChangeOperation.UPDATE));
        
        return toResponseDto(saved);
    }

    // Mapper: Entity -> Response DTO
    private HoKhauResponseDto toResponseDto(HoKhau hk) {

        List<NhanKhauResponseDto> listNhanKhauDto;

        listNhanKhauDto = nhanKhauService.getAllByHoKhauId(hk.getId());
        
        return HoKhauResponseDto.builder()
                .id(hk.getId())
                .soHoKhau(hk.getSoHoKhau())
                .tenChuHo(hk.getTenChuHo())
                .diaChi(hk.getDiaChi())
                .ngayTao(hk.getNgayTao())
                .soThanhVien(listNhanKhauDto != null ? listNhanKhauDto.size() : 0)
                .listNhanKhau(listNhanKhauDto)
                .build();
    }

    // Xóa hộ khẩu
    @Transactional
    public void delete(Long id, Authentication auth) {
        HoKhau hk = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu id = " + id));
        
        // Publish event BEFORE deletion to cascade delete ThuPhiHoKhau records
        log.info("Publishing HoKhauChangedEvent for household deletion: {}", id);
        eventPublisher.publishEvent(new HoKhauChangedEvent(this, id, ChangeOperation.DELETE));
        
        repo.delete(hk);
    }
}
