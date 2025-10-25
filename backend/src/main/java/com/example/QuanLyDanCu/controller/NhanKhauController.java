package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.service.NhanKhauService;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nhankhau")
@RequiredArgsConstructor
public class NhanKhauController {

    private final NhanKhauService nhanKhauService;

    // GET tất cả
    @GetMapping("/all")
    public List<NhanKhau> getAll() {
        return nhanKhauService.getAll();
    }

    @PostMapping
    public NhanKhau create(@RequestBody NhanKhau nhanKhau, Authentication auth) {
        return nhanKhauService.create(nhanKhau, auth);
    }
}
