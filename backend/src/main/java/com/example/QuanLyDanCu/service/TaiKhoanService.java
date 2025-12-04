package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.response.TaiKhoanResponseDto;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.exception.BusinessException;
import com.example.QuanLyDanCu.exception.NotFoundException;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaiKhoanService {

    private final TaiKhoanRepository repo;

    public List<TaiKhoanResponseDto> getAll() {
        return repo.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id, Authentication auth) {
        // Get the account to delete
        TaiKhoan account = repo.findById(id)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản id = " + id));

        // Get current user
        String currentUsername = auth.getName();
        TaiKhoan currentUser = repo.findByTenDangNhap(currentUsername)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản hiện tại"));

        // Cannot delete yourself
        if (account.getId().equals(currentUser.getId())) {
            throw new BusinessException("Không thể xóa chính tài khoản của bạn");
        }

        // Cannot delete admin accounts
        if ("ADMIN".equals(account.getVaiTro())) {
            throw new BusinessException("Không thể xóa tài khoản quản trị viên");
        }

        repo.deleteById(id);
    }

    private TaiKhoanResponseDto toResponseDto(TaiKhoan entity) {
        return TaiKhoanResponseDto.builder()
                .id(entity.getId())
                .tenDangNhap(entity.getTenDangNhap())
                .vaiTro(entity.getVaiTro())
                .hoTen(entity.getHoTen())
                .email(entity.getEmail())
                .ngayTao(entity.getNgayTao())
                .trangThai(entity.getTrangThai())
                .build();
    }
}
