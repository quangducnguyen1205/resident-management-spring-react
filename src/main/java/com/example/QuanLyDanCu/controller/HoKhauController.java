package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.entity.HoKhau;
import com.example.QuanLyDanCu.service.HoKhauService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hokhau")
@RequiredArgsConstructor
public class HoKhauController {

    private final HoKhauService service;

    @GetMapping
    public List<HoKhau> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public HoKhau getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public HoKhau create(@RequestBody HoKhau hk, Authentication auth) {
        return service.create(hk, auth);
    }

    @PutMapping("/{id}")
    public HoKhau update(@PathVariable Long id, @RequestBody HoKhau hk, Authentication auth) {
        return service.update(id, hk, auth);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth);
        return "Đã xóa hộ khẩu id = " + id;
    }
}
