package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.entity.TaiKhoan;
import com.example.QuanLyDanCu.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody TaiKhoan tk) {
        return authService.register(tk);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String token = authService.login(body.get("username"), body.get("password"));
        return Map.of("token", token);
    }
}
