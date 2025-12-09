package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.dto.request.LoginRequestDto;
import com.example.QuanLyDanCu.dto.request.RegisterRequestDto;
import com.example.QuanLyDanCu.dto.response.LoginResponseDto;
import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.exception.BadRequestException;
import com.example.QuanLyDanCu.repository.TaiKhoanRepository;
import com.example.QuanLyDanCu.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final TaiKhoanRepository repo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // New DTO-based register method
    public String register(RegisterRequestDto dto) {
        // Check if username already exists
        if (repo.findByTenDangNhap(dto.getUsername()).isPresent()) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại");
        }
        
        // Check if email already exists
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            if (repo.existsByEmail(dto.getEmail())) {
                throw new BadRequestException("Email đã tồn tại");
            }
        }

        TaiKhoan tk = TaiKhoan.builder()
                .tenDangNhap(dto.getUsername())
                .matKhau(encoder.encode(dto.getPassword()))
                .vaiTro(dto.getRole())
                .hoTen(dto.getHoTen())
                .email(dto.getEmail())
                .ngayTao(LocalDateTime.now())
                .build();
        
        repo.save(tk);
        return "Đăng ký thành công!";
    }

    // New DTO-based login method
    public LoginResponseDto login(LoginRequestDto dto) {
        Optional<TaiKhoan> acc = repo.findByTenDangNhap(dto.getUsername());
        if (acc.isEmpty() || !encoder.matches(dto.getPassword(), acc.get().getMatKhau())) {
            throw new BadRequestException("Sai tên đăng nhập hoặc mật khẩu");
        }
        
        TaiKhoan user = acc.get();
        String token = jwtUtil.generateToken(user.getTenDangNhap(), user.getVaiTro());
        
        return LoginResponseDto.builder()
                .token(token)
                .username(user.getTenDangNhap())
                .role(user.getVaiTro())
                .build();
    }
}
