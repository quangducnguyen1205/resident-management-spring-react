package com.example.QuanLyDanCu.service;

import com.example.QuanLyDanCu.entity.TaiKhoan;
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

    public String register(TaiKhoan tk) {
        tk.setMatKhau(encoder.encode(tk.getMatKhau()));
        tk.setNgayTao(LocalDateTime.now());
        repo.save(tk);
        return "Đăng ký thành công!";
    }

    public String login(String username, String password) {
        Optional<TaiKhoan> acc = repo.findByTenDangNhap(username);
        if (acc.isEmpty() || !encoder.matches(password, acc.get().getMatKhau()))
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        return jwtUtil.generateToken(username, acc.get().getVaiTro());
    }
}
