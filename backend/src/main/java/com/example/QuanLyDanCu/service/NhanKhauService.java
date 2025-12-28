package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.DangKyTamTruTamVangRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.NhanKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.enums.BienDongType;
import com.example.QuanLyDanCu.exception.BadRequestException;
import com.example.QuanLyDanCu.exception.BusinessException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.HoKhauRepository;
import com.example.QuanLyDanCu.repository.NhanKhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class NhanKhauService {
    private final HoKhauRepository hoKhauRepo;
    private final NhanKhauRepository nhanKhauRepo;
    private final BienDongService bienDongService;
    private final ThuPhiHoKhauService thuPhiHoKhauService;

    // ========== DTO-based methods ==========

    // Lấy tất cả nhân khẩu (DTO)
    public List<NhanKhauResponseDto> getAll() {
        return nhanKhauRepo.findAllByOrderByIdAsc().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Lấy nhân khẩu theo id (DTO)
    public NhanKhauResponseDto getById(Long id) {
        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        return toResponseDTO(nk);
    }

    // Lấy tất cả nhân khẩu theo ID hộ khẩu (DTO)
    public List<NhanKhauResponseDto> getAllByHoKhauId(Long id) {
        if (id == null) {
            return java.util.Collections.emptyList();
        }

        List<NhanKhau> nhanKhaus = nhanKhauRepo.findByHoKhauIdOrderByIdAsc(id);
        return nhanKhaus.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // Thêm nhân khẩu mới (DTO)
    @Transactional
    public NhanKhauResponseDto create(NhanKhauRequestDto dto, Authentication auth) {
        if (dto.getHoKhauId() == null) {
            throw new BadRequestException("Hộ khẩu không được để trống");
        }
        // Check household exists and potentially revive it
        com.example.QuanLyDanCu.entity.HoKhau hk = hoKhauRepo.findById(dto.getHoKhauId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu id = " + dto.getHoKhauId()));

        // REVIVAL_LOGIC: Nếu hộ khẩu đang bị xóa mềm (ẩn), hãy hiện lại vì có thành
        // viên mới
        if (Boolean.TRUE.equals(hk.getIsDeleted())) {
            hk.setIsDeleted(false);
            hoKhauRepo.save(hk);
        }

        // Kiểm tra CCCD không trùng lặp
        if (dto.getCmndCccd() != null && !dto.getCmndCccd().isEmpty()) {
            if (nhanKhauRepo.existsByCmndCccd(dto.getCmndCccd())) {
                throw new BadRequestException("Căn cước công dân đã tồn tại");
            }
        }

        // CCCD validation based on age
        validateCccdByAge(dto.getNgaySinh(), dto.getCmndCccd(), dto.getNgayCap(), dto.getNoiCap());

        NhanKhau nk = NhanKhau.builder()
                .hoTen(dto.getHoTen())
                .ngaySinh(dto.getNgaySinh())
                .gioiTinh(dto.getGioiTinh())
                .danToc(dto.getDanToc())
                .quocTich(dto.getQuocTich())
                .queQuan(dto.getQueQuan())
                .ngheNghiep(dto.getNgheNghiep())
                .cmndCccd(dto.getCmndCccd())
                .ngayCap(dto.getNgayCap())
                .noiCap(dto.getNoiCap())
                .quanHeChuHo(dto.getQuanHeChuHo())
                .ghiChu(dto.getGhiChu())
                .hoKhauId(dto.getHoKhauId())
                .trangThai("THUONG_TRU")
                .build();

        NhanKhau saved = nhanKhauRepo.save(nk);

        // SYNC_OWNER: Nếu là chủ hộ mới, cập nhật tên chủ hộ trong bảng HoKhau
        if ("Chủ hộ".equalsIgnoreCase(saved.getQuanHeChuHo())) {
            com.example.QuanLyDanCu.entity.HoKhau hkUpdated = hoKhauRepo.findById(saved.getHoKhauId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu"));
            hkUpdated.setTenChuHo(saved.getHoTen());
            hoKhauRepo.save(hkUpdated);
        }

        bienDongService.log(
                BienDongType.THEM_MOI_THONG_TIN,
                "Tạo nhân khẩu mới: " + saved.getHoTen(),
                saved.getHoKhauId(),
                saved.getId());

        triggerFeeRecalculation(saved.getHoKhauId());

        return toResponseDTO(saved);
    }

    // Cập nhật nhân khẩu (DTO) - PARTIAL UPDATE SUPPORT
    @Transactional
    public NhanKhauResponseDto update(Long id, NhanKhauUpdateDto dto, Authentication auth) {

        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));
        Long oldHoKhauId = existing.getHoKhauId();
        String currentQuanHeChuHo = existing.getQuanHeChuHo();

        boolean changed = false;
        List<Consumer<NhanKhau>> pendingLogs = new ArrayList<>();

        // CCCD validation if ngaySinh is being updated
        LocalDate finalNgaySinh = dto.getNgaySinh() != null ? dto.getNgaySinh() : existing.getNgaySinh();
        String finalCmndCccd = dto.getCmndCccd() != null ? dto.getCmndCccd() : existing.getCmndCccd();
        LocalDate finalNgayCap = dto.getNgayCap() != null ? dto.getNgayCap() : existing.getNgayCap();
        String finalNoiCap = dto.getNoiCap() != null ? dto.getNoiCap() : existing.getNoiCap();

        // Validate CCCD based on age
        validateCccdByAge(finalNgaySinh, finalCmndCccd, finalNgayCap, finalNoiCap);

        // STRICT_RULE_CHANGE: Không cho phép chỉnh sửa người đã KHAI_TU (trừ khi undo)
        if ("KHAI_TU".equals(existing.getTrangThai())) {
            // Nếu người dùng không gửi trangThai mới HOẶC trangThai mới vẫn là KHAI_TU ->
            // Chặn
            if (dto.getTrangThai() == null || "KHAI_TU".equals(dto.getTrangThai())) {
                throw new BadRequestException(
                        "Không thể chỉnh sửa thông tin của người đã Khai tử. Vui lòng Hủy khai tử nếu muốn cập nhật.");
            }
        }

        // REVIVAL_LOGIC_CHANGE_STATUS: Undo Khai Tu (Chuyển từ KHAI_TU -> trạng thái
        // khác)
        if (dto.getTrangThai() != null && !"KHAI_TU".equals(dto.getTrangThai())
                && "KHAI_TU".equals(existing.getTrangThai())) {

            // Check if household has any active members (excluding this one, as it's still
            // KHAI_TU in DB)
            long activeCount = nhanKhauRepo.countActiveMembersExcludeStatus(existing.getHoKhauId(), "KHAI_TU");

            if (activeCount == 0) {
                // Scenario A: Household Empty -> Force Owner
                // Override input to ensure they become owner
                dto.setQuanHeChuHo("Chủ hộ");
            }
            // Scenario B: has members -> existing logic allows user to pick role or keeps
        }

        // Cập nhật các trường thông tin cá nhân
        if (dto.getHoTen() != null && !Objects.equals(existing.getHoTen(), dto.getHoTen())) {
            String oldVal = existing.getHoTen();
            String newVal = dto.getHoTen();
            existing.setHoTen(newVal);
            changed = true;
            addChangeLog(pendingLogs, "họ tên", oldVal, newVal);
        }
        if (dto.getNgaySinh() != null && !Objects.equals(existing.getNgaySinh(), dto.getNgaySinh())) {
            LocalDate oldVal = existing.getNgaySinh();
            LocalDate newVal = dto.getNgaySinh();
            existing.setNgaySinh(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ngày sinh", oldVal, newVal);
        }
        if (dto.getGioiTinh() != null && !Objects.equals(existing.getGioiTinh(), dto.getGioiTinh())) {
            String oldVal = existing.getGioiTinh();
            String newVal = dto.getGioiTinh();
            existing.setGioiTinh(newVal);
            changed = true;
            addChangeLog(pendingLogs, "giới tính", oldVal, newVal);
        }
        if (dto.getDanToc() != null && !Objects.equals(existing.getDanToc(), dto.getDanToc())) {
            String oldVal = existing.getDanToc();
            String newVal = dto.getDanToc();
            existing.setDanToc(newVal);
            changed = true;
            addChangeLog(pendingLogs, "dân tộc", oldVal, newVal);
        }
        if (dto.getQuocTich() != null && !Objects.equals(existing.getQuocTich(), dto.getQuocTich())) {
            String oldVal = existing.getQuocTich();
            String newVal = dto.getQuocTich();
            existing.setQuocTich(newVal);
            changed = true;
            addChangeLog(pendingLogs, "quốc tịch", oldVal, newVal);
        }
        if (dto.getQueQuan() != null && !Objects.equals(existing.getQueQuan(), dto.getQueQuan())) {
            String oldVal = existing.getQueQuan();
            String newVal = dto.getQueQuan();
            existing.setQueQuan(newVal);
            changed = true;
            addChangeLog(pendingLogs, "quê quán", oldVal, newVal);
        }
        if (dto.getNgheNghiep() != null && !Objects.equals(existing.getNgheNghiep(), dto.getNgheNghiep())) {
            String oldVal = existing.getNgheNghiep();
            String newVal = dto.getNgheNghiep();
            existing.setNgheNghiep(newVal);
            changed = true;
            addChangeLog(pendingLogs, "nghề nghiệp", oldVal, newVal);
        }
        if (dto.getCmndCccd() != null && !Objects.equals(existing.getCmndCccd(), dto.getCmndCccd())) {
            String oldVal = existing.getCmndCccd();
            String newVal = dto.getCmndCccd();
            existing.setCmndCccd(newVal);
            changed = true;
            addChangeLog(pendingLogs, "CMND/CCCD", oldVal, newVal);
        }
        if (dto.getNgayCap() != null && !Objects.equals(existing.getNgayCap(), dto.getNgayCap())) {
            LocalDate oldVal = existing.getNgayCap();
            LocalDate newVal = dto.getNgayCap();
            existing.setNgayCap(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ngày cấp CMND/CCCD", oldVal, newVal);
        }
        if (dto.getNoiCap() != null && !Objects.equals(existing.getNoiCap(), dto.getNoiCap())) {
            String oldVal = existing.getNoiCap();
            String newVal = dto.getNoiCap();
            existing.setNoiCap(newVal);
            changed = true;
            addChangeLog(pendingLogs, "nơi cấp CMND/CCCD", oldVal, newVal);
        }
        if (dto.getQuanHeChuHo() != null && !Objects.equals(existing.getQuanHeChuHo(), dto.getQuanHeChuHo())) {
            String oldVal = existing.getQuanHeChuHo();
            String newVal = dto.getQuanHeChuHo();
            existing.setQuanHeChuHo(newVal);
            changed = true;
            addChangeLog(pendingLogs, "quan hệ với chủ hộ", oldVal, newVal);
        }
        if (dto.getGhiChu() != null && !Objects.equals(existing.getGhiChu(), dto.getGhiChu())) {
            String oldVal = existing.getGhiChu();
            String newVal = dto.getGhiChu();
            existing.setGhiChu(newVal);
            changed = true;
            addChangeLog(pendingLogs, "ghi chú", oldVal, newVal);
        }
        if (dto.getTrangThai() != null && !Objects.equals(existing.getTrangThai(), dto.getTrangThai())) {
            String oldVal = existing.getTrangThai();
            String newVal = dto.getTrangThai();
            existing.setTrangThai(newVal);
            changed = true;
            addChangeLog(pendingLogs, "trạng thái", oldVal, newVal);
        }
        if (dto.getHoKhauId() != null && !Objects.equals(existing.getHoKhauId(), dto.getHoKhauId())) {
            // STRICT_RULE_TRANSFER: Kiểm tra trước khi chuyển
            long livingMembers = nhanKhauRepo.countActiveMembersExcludeStatus(oldHoKhauId, "KHAI_TU");
            if ("Chủ hộ".equalsIgnoreCase(currentQuanHeChuHo)) {
                if (livingMembers > 1) {
                    throw new BadRequestException(
                            "Chủ hộ không được chuyển đi khi hộ còn thành viên khác (Số lượng: " + livingMembers
                                    + "). Vui lòng chuyển quyền chủ hộ cho người khác trước.");
                }
            }

            Long newHoKhauId = dto.getHoKhauId();

            // STRICT_RULE_TRANSFER: Không được làm Chủ hộ ngay khi chuyển sang hộ mới
            // Vì hộ mới (đã tồn tại) bắt buộc phải có chủ rồi -> Chỉ được làm Thành viên.
            if ("Chủ hộ".equalsIgnoreCase(dto.getQuanHeChuHo())) {
                throw new BadRequestException("Vui lòng chọn mối quan hệ khác (Hộ mới đã có chủ hộ).");
            }

            existing.setHoKhauId(newHoKhauId);
            changed = true;
            pendingLogs.add(nk -> bienDongService.log(
                    BienDongType.CHUYEN_DEN,
                    String.format("Nhân khẩu %s chuyển đến hộ %s", existing.getHoTen(), newHoKhauId),
                    newHoKhauId,
                    nk.getId()));
        }

        // STRICT_RULE_UPDATE: Nếu đặt người này là "Chủ hộ", phải hủy quyền chủ hộ của
        // người cũ (xử lý cả trường hợp database lỗi có > 1 chủ hộ)
        if ("Chủ hộ".equalsIgnoreCase(dto.getQuanHeChuHo())) {
            List<NhanKhau> oldOwners = nhanKhauRepo.findByHoKhauIdAndQuanHeChuHo(existing.getHoKhauId(), "Chủ hộ");
            for (NhanKhau oldOwner : oldOwners) {
                if (!oldOwner.getId().equals(existing.getId())) {
                    oldOwner.setQuanHeChuHo("Thành viên");
                    nhanKhauRepo.save(oldOwner);
                    // Log change for old owner
                    bienDongService.log(
                            BienDongType.THAY_DOI_THONG_TIN,
                            "Tự động chuyển thành 'Thành viên' do " + dto.getHoTen() + " làm Chủ hộ mới",
                            oldOwner.getHoKhauId(),
                            oldOwner.getId());
                }
            }
        }

        // SWAP_OWNER_ROLE: Nếu người đang sửa LÀ "Chủ hộ" và họ muốn đổi thành quan hệ
        // khác (Ví dụ: "Thành viên")
        // Thì BẮT BUỘC họ phải chọn một người khác làm "Chủ hộ" mới.
        // FIX: Chỉ áp dụng nếu KHÔNG chuyển hộ (tức là ở lại hộ cũ mà bỏ quyền chủ hộ).
        // Nếu chuyển hộ, việc "bỏ hộ cũ" đã được xử lý ở logic STRICT_RULE_TRANSFER bên
        // trên.
        if (Objects.equals(oldHoKhauId, dto.getHoKhauId())
                && "Chủ hộ".equalsIgnoreCase(currentQuanHeChuHo) && dto.getQuanHeChuHo() != null
                && !"Chủ hộ".equalsIgnoreCase(dto.getQuanHeChuHo())) {

            if (dto.getNewChuHoId() == null) {
                throw new BadRequestException(
                        "Bạn đang thay đổi vai trò của Chủ hộ. Vui lòng chọn Chủ hộ mới để thay thế.");
            }

            NhanKhau newOwner = nhanKhauRepo.findById(dto.getNewChuHoId())
                    .orElseThrow(
                            () -> new NotFoundException("Không tìm thấy chủ hộ mới với ID = " + dto.getNewChuHoId()));

            if (!Objects.equals(newOwner.getHoKhauId(), existing.getHoKhauId())) {
                throw new BadRequestException("Chủ hộ mới phải thuộc cùng một hộ khẩu.");
            }

            // Set người mới làm Chủ hộ
            newOwner.setQuanHeChuHo("Chủ hộ");
            nhanKhauRepo.save(newOwner);

            // Cập nhật tên chủ hộ trong bảng Hộ Khẩu ngay lập tức (Dùng Custom Query để
            // tránh lỗi mất thành viên)
            hoKhauRepo.updateTenChuHo(existing.getHoKhauId(), newOwner.getHoTen());

            bienDongService.log(BienDongType.THAY_DOI_THONG_TIN,
                    "Chuyển quyền Chủ hộ từ " + existing.getHoTen() + " sang " + newOwner.getHoTen(),
                    existing.getHoKhauId(), newOwner.getId());

            // Trigger fee recalc
            triggerFeeRecalculation(existing.getHoKhauId());
        }

        if (!changed) {
            throw new BusinessException("Không có gì để thay đổi");
        }

        NhanKhau saved = nhanKhauRepo.save(existing);

        // SYNC_OWNER: Nếu sau khi update, người này là Chủ hộ, hãy cập nhật tên chủ hộ
        // trong HoKhau
        if ("Chủ hộ".equalsIgnoreCase(saved.getQuanHeChuHo())) {
            com.example.QuanLyDanCu.entity.HoKhau hk = hoKhauRepo.findById(saved.getHoKhauId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hộ khẩu"));
            if (!Objects.equals(hk.getTenChuHo(), saved.getHoTen())) {
                hoKhauRepo.updateTenChuHo(saved.getHoKhauId(), saved.getHoTen());
            }
        }

        pendingLogs.forEach(callback -> callback.accept(saved));

        if (!Objects.equals(oldHoKhauId, saved.getHoKhauId())) {
            triggerFeeRecalculation(oldHoKhauId);

            // STRICT_RULE_TRANSFER: Nếu hộ cũ không còn ai (sống) -> Xóa Hộ Khẩu
            // Lưu ý: remaining tính cả người đang chuyển đi (vì query DB vẫn thấy member
            // oldHoKhauId)
            // Nên điều kiện là remaining <= 1 (người cuối cùng chuyển đi)
            long remaining = nhanKhauRepo.countActiveMembersExcludeStatus(oldHoKhauId, "KHAI_TU");
            if (remaining == 0) {
                // Nếu không còn thành viên sống nào khác, đánh dấu xóa mềm hộ khẩu
                hoKhauRepo.findById(oldHoKhauId).ifPresent(hk -> {
                    hk.setIsDeleted(true);
                    hoKhauRepo.save(hk);
                });
            }
        }

        // REVIVAL_LOGIC: Khi chuyển đến hộ mới, nếu hộ đó đang bị ẩn, hãy hiện lại
        if (saved.getHoKhauId() != null) {
            hoKhauRepo.findById(saved.getHoKhauId()).ifPresent(hk -> {
                if (Boolean.TRUE.equals(hk.getIsDeleted())) {
                    hk.setIsDeleted(false);
                    hoKhauRepo.save(hk);
                }
            });
        }

        triggerFeeRecalculation(saved.getHoKhauId());

        return toResponseDTO(saved);
    }

    // Xóa nhân khẩu
    @Transactional
    public void delete(Long id, Authentication auth) {

        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));

        Long hoKhauId = nk.getHoKhauId();

        BienDongType deletionType = "Đã mất".equalsIgnoreCase(nk.getGhiChu())
                ? BienDongType.KHAI_TU
                : BienDongType.THAY_DOI_THONG_TIN;
        String content = deletionType == BienDongType.KHAI_TU
                ? "Xóa hồ sơ nhân khẩu đã qua đời: " + nk.getHoTen()
                : "Xóa nhân khẩu " + nk.getHoTen();
        bienDongService.log(deletionType, content, hoKhauId, null);

        // CASE: Remove detached resident (e.g. Deceased) -> No household checks needed
        if (hoKhauId == null) {
            nhanKhauRepo.delete(nk);
            return;
        }

        // STRICT_RULE_DELETE:
        // Đếm số thành viên còn sống (không tính KHAI_TU)
        long livingMembers = nhanKhauRepo.countActiveMembersExcludeStatus(hoKhauId, "KHAI_TU");

        if (livingMembers > 1) {
            // Nếu còn nhiều hơn 1 người sống -> Không được xóa Chủ hộ
            if ("Chủ hộ".equalsIgnoreCase(nk.getQuanHeChuHo())) {
                throw new BadRequestException(
                        "Không thể xóa 'Chủ hộ' khi vẫn còn thành viên khác. Vui lòng chọn chủ hộ mới trước.");
            }
        }

        nhanKhauRepo.delete(nk);
        triggerFeeRecalculation(hoKhauId);

        // STRICT_RULE_DELETE: Nếu đây là người sống cuối cùng (livingMembers <= 1), xóa
        // luôn hộ khẩu.
        // Lưu ý: livingMembers tính cả người đang bị xóa, nên <= 1 nghĩa là sau khi xóa
        // sẽ còn 0 (hoặc chỉ còn người chết).
        // Tuy nhiên, nếu hộ khẩu còn người KHAI_TU (đã chết), việc xóa Hộ khẩu sẽ xóa
        // luôn các record KHAI_TU đó (cascade).
        // Theo yêu cầu "hộ khẩu cũng sẽ biến mất", ta thực hiện điều này.
        if (livingMembers <= 1) {
            // Kiểm tra xem có record nào khác không (bao gồm cả chết)
            long anyMembers = nhanKhauRepo.countByHoKhauId(hoKhauId);
            if (anyMembers == 0) { // Đã xóa hết sạch
                hoKhauRepo.findById(hoKhauId).ifPresent(hk -> {
                    hk.setIsDeleted(true);
                    hoKhauRepo.save(hk);
                });
            } else {
                // Xóa mềm hộ khẩu
                hoKhauRepo.findById(hoKhauId).ifPresent(hk -> {
                    hk.setIsDeleted(true);
                    hoKhauRepo.save(hk);
                });
            }
        } else {
            // SYNC_OWNER: (Logic cũ) Nếu xóa chủ hộ (trường hợp count > 1 đã chặn ở trên,
            // nhưng giữ lại logic này cho an toàn hoặc thay đổi tương lai)
            if ("Chủ hộ".equalsIgnoreCase(nk.getQuanHeChuHo())) {
                hoKhauRepo.findById(hoKhauId).ifPresent(hk -> {
                    hk.setTenChuHo(null);
                    hoKhauRepo.save(hk);
                });
            }
        }
    }

    // --- TẠM TRÚ ---
    public NhanKhauResponseDto dangKyTamTru(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải bé hơn ngày kết thúc");
        }

        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setTamTruTu(dto.getNgayBatDau());
        nk.setTamTruDen(dto.getNgayKetThuc());
        nk.setTrangThai("TAM_TRU");

        String content = "Đăng ký tạm trú cho " + nk.getHoTen()
                + " từ " + dto.getNgayBatDau()
                + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
                + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : "");
        bienDongService.log(BienDongType.TAM_TRU, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        return toResponseDTO(saved);
    }

    public void huyTamTru(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));

        LocalDate today = LocalDate.now();
        if (existing.getTamTruTu() != null && existing.getTamTruTu().isAfter(today)) {
            // Chưa đến ngày bắt đầu -> Xóa luôn
            existing.setTamTruTu(null);
            existing.setTamTruDen(null);
        } else {
            // Đã bắt đầu -> Kết thúc sớm
            existing.setTamTruDen(today);
        }

        existing.setTrangThai("THUONG_TRU");

        bienDongService.log(
                BienDongType.HUY_TAM_TRU,
                "Kết thúc tạm trú cho " + existing.getHoTen(),
                existing.getHoKhauId(),
                existing.getId());
        nhanKhauRepo.save(existing);
    }

    // --- TẠM VẮNG ---
    public NhanKhauResponseDto dangKyTamVang(Long id, DangKyTamTruTamVangRequestDto dto, Authentication auth) {
        if (!dto.getNgayBatDau().isBefore(dto.getNgayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải bé hơn ngày kết thúc");
        }

        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setTamVangTu(dto.getNgayBatDau());
        nk.setTamVangDen(dto.getNgayKetThuc());
        nk.setTrangThai("TAM_VANG");

        String content = "Đăng ký tạm vắng cho " + nk.getHoTen()
                + " từ " + dto.getNgayBatDau()
                + (dto.getNgayKetThuc() != null ? " đến " + dto.getNgayKetThuc() : "")
                + (dto.getLyDo() != null ? " - Lý do: " + dto.getLyDo() : "");
        bienDongService.log(BienDongType.TAM_VANG, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        triggerFeeRecalculation(saved.getHoKhauId());

        return toResponseDTO(saved);
    }

    public void huyTamVang(Long id, Authentication auth) {
        NhanKhau existing = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu id = " + id));

        LocalDate today = LocalDate.now();
        if (existing.getTamVangTu() != null && existing.getTamVangTu().isAfter(today)) {
            // Chưa đến ngày bắt đầu -> Xóa luôn
            existing.setTamVangTu(null);
            existing.setTamVangDen(null);
        } else {
            // Đã bắt đầu -> Kết thúc sớm (set ngày kết thúc = hôm nay)
            existing.setTamVangDen(today);
        }

        existing.setTrangThai("THUONG_TRU");

        bienDongService.log(
                BienDongType.HUY_TAM_VANG,
                "Kết thúc tạm vắng cho " + existing.getHoTen(),
                existing.getHoKhauId(),
                existing.getId());
        nhanKhauRepo.save(existing);
        triggerFeeRecalculation(existing.getHoKhauId());
    }

    // --- KHAI TỬ ---
    public NhanKhauResponseDto khaiTu(Long id, String lyDo, Authentication auth) {
        NhanKhau nk = nhanKhauRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân khẩu"));

        nk.setGhiChu("Đã mất");
        nk.setTamTruTu(null);
        nk.setTamTruDen(null);
        nk.setTamVangTu(null);
        nk.setTamVangDen(null);
        nk.setTrangThai("KHAI_TU");

        // STRICT_RULE_DEATH:
        long livingMembers = nhanKhauRepo.countActiveMembersExcludeStatus(nk.getHoKhauId(), "KHAI_TU");
        // livingMembers tính cả NK này (vì chưa set KHAI_TU trong DB, chỉ mới set trong
        // memory nk object nhưng chưa save?
        // Ah, nk object is managed/derived.
        // count query truy vấn DB -> DB vẫn thấy status cũ (THUONG_TRU).
        // Vậy livingMembers >= 1.

        if (livingMembers > 1 && "Chủ hộ".equalsIgnoreCase(nk.getQuanHeChuHo())) {
            throw new BadRequestException(
                    "Không thể Khai tử 'Chủ hộ' khi vẫn còn thành viên khác. Vui lòng chuyển quyền chủ hộ trước.");
        }

        String content = "Khai tử: " + nk.getHoTen() + (lyDo != null ? " - Lý do: " + lyDo : "");
        bienDongService.log(BienDongType.KHAI_TU, content, nk.getHoKhauId(), nk.getId());

        NhanKhau saved = nhanKhauRepo.save(nk);

        // STRICT_RULE_DEATH: Nếu là người sống cuối cùng -> Xóa luôn hộ khẩu
        if (livingMembers <= 1) {
            hoKhauRepo.findById(saved.getHoKhauId()).ifPresent(hk -> {
                hk.setIsDeleted(true);
                hoKhauRepo.save(hk);
            });
        }

        // Detach from household
        nk.setHoKhauId(null);
        nk.setQuanHeChuHo(null);
        nhanKhauRepo.save(nk);

        return toResponseDTO(saved);
    }

    // Search theo tên
    public java.util.List<com.example.QuanLyDanCu.entity.NhanKhau> searchByName(String keyword) {
        if (keyword == null || keyword.isBlank())
            return java.util.Collections.emptyList();
        return nhanKhauRepo.findByHoTenContainingIgnoreCase(keyword.trim());
    }

    public List<NhanKhauResponseDto> searchDtoByName(String keyword) {
        return searchByName(keyword).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Thống kê giới tính (toàn bộ)
    public java.util.Map<String, Object> statsGender() {
        var rows = nhanKhauRepo.countByGioiTinh();
        long total = 0;
        java.util.Map<String, Long> byGender = new java.util.LinkedHashMap<>();
        for (var r : rows) {
            String k = r.getGioiTinh() == null ? "Không xác định" : r.getGioiTinh();
            byGender.put(k, r.getTotal());
            total += r.getTotal();
        }
        java.util.Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("total", total);
        out.put("byGender", byGender);
        return out;
    }

    // Thống kê theo tuổi: thiếu nhi / đi làm / về hưu
    public Map<String, Object> statsByAge() {

        LocalDate now = LocalDate.now();

        long diHoc = 0;
        long diLam = 0;
        long veHuu = 0;

        List<NhanKhau> all = nhanKhauRepo.findAll().stream()
                .filter(nk -> !"KHAI_TU".equals(nk.getTrangThai()))
                .collect(Collectors.toList());

        for (NhanKhau nk : all) {
            if (nk.getNgaySinh() == null)
                continue;

            int age = java.time.Period.between(nk.getNgaySinh(), now).getYears();

            if (age <= 16) {
                diHoc++;
            } else if (age < 60) {
                diLam++;
            } else {
                veHuu++;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", all.size());

        result.put("diHoc", Map.of(
                "label", "Đi học (≤16 tuổi)",
                "soNguoi", diHoc));
        result.put("diLam", Map.of(
                "label", "Đi làm (17–59 tuổi)",
                "soNguoi", diLam));
        result.put("veHuu", Map.of(
                "label", "Về hưu (≥60 tuổi)",
                "soNguoi", veHuu));

        return result;
    }

    // Thống kê theo trạng thái (Tạm trú / Tạm vắng / Thường trú)
    public Map<String, Object> statsByStatus() {
        var rows = nhanKhauRepo.countByTrangThai();
        long total = 0;
        Map<String, Long> byStatus = new LinkedHashMap<>();

        // Initialize keys
        byStatus.put("THUONG_TRU", 0L);
        byStatus.put("TAM_TRU", 0L);
        byStatus.put("TAM_VANG", 0L);

        for (var r : rows) {
            String k = r.getTrangThai() == null ? "THUONG_TRU" : r.getTrangThai();
            if (!"KHAI_TU".equals(k)) {
                byStatus.put(k, r.getTotal());
                total += r.getTotal();
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", total);
        out.put("byStatus", byStatus);

        // Add human-readable labels
        Map<String, String> labels = new LinkedHashMap<>();
        labels.put("THUONG_TRU", "Thường trú");
        labels.put("TAM_TRU", "Tạm trú");
        labels.put("TAM_VANG", "Tạm vắng");
        out.put("labels", labels);

        return out;
    }

    private void triggerFeeRecalculation(Long hoKhauId) {
        if (hoKhauId == null) {
            return;
        }
        thuPhiHoKhauService.recalculateForHousehold(hoKhauId);
    }

    // --- helper ---

    private void addChangeLog(List<Consumer<NhanKhau>> pendingLogs, String fieldLabel, Object oldValue,
            Object newValue) {
        final String message = formatChange(fieldLabel, oldValue, newValue);
        pendingLogs.add(nk -> bienDongService.log(
                BienDongType.THAY_DOI_THONG_TIN,
                message,
                nk.getHoKhauId(),
                nk.getId()));
    }

    private String formatChange(String fieldLabel, Object oldValue, Object newValue) {
        return String.format("Cập nhật %s: '%s' → '%s'",
                fieldLabel,
                formatValue(oldValue),
                formatValue(newValue));
    }

    private String formatValue(Object value) {
        return value == null ? "" : value.toString();
    }

    /**
     * Validate CCCD fields based on age
     * - If age < 14: all CCCD fields must be null/empty
     * - If age >= 14: all CCCD fields required, ngayCap must be >= ngaySinh + 14
     * years and <= today
     */
    private void validateCccdByAge(LocalDate ngaySinh, String cmndCccd, LocalDate ngayCap, String noiCap) {
        if (ngaySinh == null) {
            throw new BadRequestException("Ngày sinh không được để trống");
        }

        LocalDate today = LocalDate.now();
        int age = java.time.Period.between(ngaySinh, today).getYears();

        boolean hasCccdData = (cmndCccd != null && !cmndCccd.trim().isEmpty()) ||
                (ngayCap != null) ||
                (noiCap != null && !noiCap.trim().isEmpty());

        if (age < 14) {
            // Under 14: CCCD fields must be empty
            if (hasCccdData) {
                throw new BadRequestException(
                        "Người dưới 14 tuổi không được cấp CMND/CCCD. " +
                                "Vui lòng để trống các trường: CMND/CCCD, Ngày cấp, Nơi cấp");
            }
        } else {
            // Age >= 14: All CCCD fields required
            if (cmndCccd == null || cmndCccd.trim().isEmpty()) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có CMND/CCCD");
            }
            if (ngayCap == null) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có ngày cấp CMND/CCCD");
            }
            if (noiCap == null || noiCap.trim().isEmpty()) {
                throw new BadRequestException("Người từ 14 tuổi trở lên phải có nơi cấp CMND/CCCD");
            }

            // Validate CMND/CCCD format (9-12 digits)
            if (!cmndCccd.matches("\\d{9,12}")) {
                throw new BadRequestException("CMND/CCCD phải có 9-12 chữ số");
            }

            // Validate ngayCap >= ngaySinh + 14 years
            LocalDate minIssuanceDate = ngaySinh.plusYears(14);
            if (ngayCap.isBefore(minIssuanceDate)) {
                throw new BadRequestException(
                        "Ngày cấp CMND/CCCD phải sau ngày sinh ít nhất 14 năm (từ " +
                                minIssuanceDate + " trở đi)");
            }

            // Validate ngayCap <= today
            if (ngayCap.isAfter(today)) {
                throw new BadRequestException("Ngày cấp CMND/CCCD không được là ngày trong tương lai");
            }
        }
    }

    // Mapper: Entity -> Response DTO
    private NhanKhauResponseDto toResponseDTO(NhanKhau nk) {

        return NhanKhauResponseDto.builder()
                .id(nk.getId())
                .hoTen(nk.getHoTen())
                .ngaySinh(nk.getNgaySinh())
                .gioiTinh(nk.getGioiTinh())
                .danToc(nk.getDanToc())
                .quocTich(nk.getQuocTich())
                .queQuan(nk.getQueQuan())
                .ngheNghiep(nk.getNgheNghiep())
                .cmndCccd(nk.getCmndCccd())
                .ngayCap(nk.getNgayCap())
                .noiCap(nk.getNoiCap())
                .quanHeChuHo(nk.getQuanHeChuHo())
                .ghiChu(nk.getGhiChu())
                .tamVangTu(nk.getTamVangTu())
                .tamVangDen(nk.getTamVangDen())
                .tamTruTu(nk.getTamTruTu())
                .tamTruDen(nk.getTamTruDen())
                .trangThaiHienTai(nk.getTrangThai())
                .trangThai(nk.getTrangThai())
                .hoKhauId(nk.getHoKhauId())
                .build();
    }
}
