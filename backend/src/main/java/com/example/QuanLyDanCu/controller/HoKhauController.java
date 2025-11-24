package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.request.HoKhauRequestDto;
import com.example.QuanLyDanCu.dto.request.HoKhauUpdateDto;
import com.example.QuanLyDanCu.dto.response.HoKhauResponseDto;
import com.example.QuanLyDanCu.service.HoKhauService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ho-khau")
@RequiredArgsConstructor
@Tag(name = "Hộ Khẩu", description = "API quản lý hộ khẩu")
public class HoKhauController {

    private final HoKhauService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG','KETOAN')")
    @Operation(summary = "Lấy danh sách tất cả hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<HoKhauResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG','KETOAN')")
    @Operation(summary = "Lấy hộ khẩu theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy hộ khẩu"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy hộ khẩu")
    })
    public ResponseEntity<HoKhauResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG')")
    @Operation(summary = "Tạo hộ khẩu mới")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền")
    })
    public ResponseEntity<HoKhauResponseDto> create(
            @Valid @RequestBody HoKhauRequestDto dto, 
            Authentication auth) {
        HoKhauResponseDto created = service.create(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG')")
    @Operation(summary = "Cập nhật hộ khẩu (partial update)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy hộ khẩu")
    })
    public ResponseEntity<HoKhauResponseDto> update(
            @PathVariable Long id, 
            @RequestBody HoKhauUpdateDto dto, 
            Authentication auth) {
        HoKhauResponseDto updated = service.update(id, dto, auth);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG')")
    @Operation(summary = "Xóa hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy hộ khẩu")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth);
    }
}
