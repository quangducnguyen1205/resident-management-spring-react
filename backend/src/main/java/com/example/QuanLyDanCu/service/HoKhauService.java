package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.HoKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.HoKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.HoKhauResponseDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.enums.BienDongType;
import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.exception.BusinessException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoKhauService {

    private final HoKhauRepository hoKhauRepo;
    private final NhanKhauService nhanKhauService;
    private final BienDongService bienDongService;

    // ========== DTO-based methods ==========

    // Lấy tất cả hộ khẩu (DTO) - ordered by soHoKhau for stable UI display
    public List<HoKhauResponseDto> getAll() {
        return hoKhauRepo.findActiveHouseholds().stream()
                .map(hk -> toResponseDto(hk))
                .collect(Collectors.toList());
    }

    // Lấy hộ khẩu theo id (DTO)
    public HoKhauResponseDto getById(Long id) {
        HoKhau hk = hoKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu id = " + id));
        return toResponseDto(hk);
    }

    // Thêm hộ khẩu mới (DTO)
    @Transactional
    public HoKhauResponseDto create(HoKhauRequestDto dto, Authentication auth) {
        // Kiểm tra trùng số hộ khẩu
        if (hoKhauRepo.existsBySoHoKhau(dto.getSoHoKhau())) {
            throw new BusinessException("Số hộ khẩu " + dto.getSoHoKhau() + " đã tồn tại");
        }
        HoKhau hk = HoKhau.builder()
                .soHoKhau(dto.getSoHoKhau())
                .tenChuHo(dto.getTenChuHo())
                .diaChi(dto.getDiaChi())
                .ngayTao(LocalDate.now())
                .build();

        HoKhau saved = hoKhauRepo.save(hk);

        bienDongService.log(
                BienDongType.THEM_MOI_THONG_TIN,
                "Tạo hộ khẩu mới: " + saved.getSoHoKhau(),
                saved.getId(),
                null);

        return toResponseDto(saved);
    }

    // Cập nhật hộ khẩu (DTO) - PARTIAL UPDATE SUPPORT
    // Note: soHoKhau is immutable and cannot be updated
    @Transactional
    public HoKhauResponseDto update(Long id, HoKhauUpdateDto dto, Authentication auth) {
        HoKhau existing = hoKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu id = " + id));

        boolean changed = false;
        List<Runnable> pendingLogs = new ArrayList<>();
        final Long hoKhauId = existing.getId();

        // Cập nhật tên chủ hộ (only if provided)
        if (dto.getTenChuHo() != null && !Objects.equals(existing.getTenChuHo(), dto.getTenChuHo())) {
            String oldVal = existing.getTenChuHo();
            String newVal = dto.getTenChuHo();
            existing.setTenChuHo(dto.getTenChuHo());
            changed = true;
            pendingLogs.add(() -> bienDongService.log(
                    BienDongType.THAY_DOI_THONG_TIN,
                    String.format("Đổi chủ hộ: %s → %s", oldVal, newVal),
                    hoKhauId,
                    null));
        }

        // Cập nhật địa chỉ (only if provided)
        if (dto.getDiaChi() != null && !Objects.equals(existing.getDiaChi(), dto.getDiaChi())) {
            String oldVal = existing.getDiaChi();
            String newVal = dto.getDiaChi();
            existing.setDiaChi(dto.getDiaChi());
            changed = true;
            pendingLogs.add(() -> bienDongService.log(
                    BienDongType.THAY_DOI_THONG_TIN,
                    String.format("Cập nhật địa chỉ hộ khẩu: '%s' → '%s'",
                            oldVal == null ? "" : oldVal,
                            newVal == null ? "" : newVal),
                    hoKhauId,
                    null));
        }

        if (!changed) {
            throw new BusinessException("Không có gì để thay đổi");
        }

        HoKhau saved = hoKhauRepo.save(existing);

        pendingLogs.forEach(Runnable::run);

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
        if (!hoKhauRepo.existsById(id)) {
            throw new NotFoundException("Không tìm thấy hộ khẩu id = " + id);
        }

        hoKhauRepo.deleteById(id);
    }
}
