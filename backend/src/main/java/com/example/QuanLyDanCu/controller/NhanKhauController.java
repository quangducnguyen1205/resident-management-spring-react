package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.service.NhanKhauService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

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

    // Tạo nhân khẩu (giữ nguyên)
    @PostMapping
    public NhanKhau create(@RequestBody NhanKhau nhanKhau, Authentication auth) {
        return nhanKhauService.create(nhanKhau, auth);
    }

    // --- TẠM TRÚ ---
    @PutMapping("/{id}/tamtru")
    public NhanKhau dangKyTamTru(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        LocalDate tu  = parseDateRequired(body.get("tu"), "tu");
        LocalDate den = parseDateOptional(body.get("den"));
        String lyDo   = body.get("lyDo") != null ? body.get("lyDo").toString() : null;

        if (den != null && den.isBefore(tu)) {
            throw new ResponseStatusException(BAD_REQUEST, "Ngày kết thúc phải >= ngày bắt đầu");
        }
        return nhanKhauService.dangKyTamTru(id, tu, den, lyDo, auth);
    }

    @DeleteMapping("/{id}/tamtru")
    public NhanKhau huyTamTru(@PathVariable Long id, Authentication auth) {
        return nhanKhauService.huyTamTru(id, auth);
    }

    // --- TẠM VẮNG ---
    @PutMapping("/{id}/tamvang")
    public NhanKhau dangKyTamVang(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        LocalDate tu  = parseDateRequired(body.get("tu"), "tu");
        LocalDate den = parseDateOptional(body.get("den"));
        String lyDo   = body.get("lyDo") != null ? body.get("lyDo").toString() : null;

        if (den != null && den.isBefore(tu)) {
            throw new ResponseStatusException(BAD_REQUEST, "Ngày kết thúc phải >= ngày bắt đầu");
        }
        return nhanKhauService.dangKyTamVang(id, tu, den, lyDo, auth);
    }

    @DeleteMapping("/{id}/tamvang")
    public NhanKhau huyTamVang(@PathVariable Long id, Authentication auth) {
        return nhanKhauService.huyTamVang(id, auth);
    }

    // --- KHAI TỬ ---
    @PutMapping("/{id}/khaitu")
    public NhanKhau khaiTu(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String lyDo = body.get("lyDo") != null ? body.get("lyDo").toString() : null;
        return nhanKhauService.khaiTu(id, lyDo, auth);
    }

    // Search theo tên
    @GetMapping("/search")
    public java.util.List<com.example.QuanLyDanCu.entity.NhanKhau> searchByName(@RequestParam("q") String q) {
        return nhanKhauService.searchByName(q);
    }

    // Thống kê giới tính
    @GetMapping("/stats/gender")
    public java.util.Map<String, Object> statsGender() {
        return nhanKhauService.statsGender();
    }

    // Thống kê theo tuổi (thiếu nhi/đi làm/về hưu)
    @GetMapping("/stats/age")
    public java.util.Map<String, Object> statsByAge(
            @RequestParam(value = "underAge", required = false) Integer underAge,
            @RequestParam(value = "retireAge", required = false) Integer retireAge
    ) {
        return nhanKhauService.statsByAge(underAge, retireAge);
    }


    // ===== Helpers =====
    private LocalDate parseDateRequired(Object v, String fieldName) {
        if (v == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Thiếu trường ngày bắt buộc: " + fieldName + " (yyyy-MM-dd)");
        }
        try {
            return (v instanceof LocalDate d) ? d : LocalDate.parse(v.toString());
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Sai định dạng ngày cho '" + fieldName + "'. Dùng yyyy-MM-dd");
        }
    }

    private LocalDate parseDateOptional(Object v) {
        if (v == null) return null;
        try {
            return (v instanceof LocalDate d) ? d : LocalDate.parse(v.toString());
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Sai định dạng ngày cho 'den'. Dùng yyyy-MM-dd");
        }
    }
}
