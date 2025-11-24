package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.response.TaiKhoanResponseDto;
import com.example.QuanLyDanCu.service.TaiKhoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tai-khoan")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "API quản lý tài khoản (ADMIN only)")
@SecurityRequirement(name = "Bearer Authentication")
public class TaiKhoanController {
    
    private final TaiKhoanService service;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Lấy danh sách tất cả tài khoản", description = "Chỉ ADMIN mới có quyền truy cập")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    public ResponseEntity<List<TaiKhoanResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "Xóa tài khoản", description = "ADMIN xóa tài khoản (không được xóa ADMIN hoặc chính mình)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa thành công"),
            @ApiResponse(responseCode = "400", description = "Không thể xóa tài khoản ADMIN hoặc chính mình"),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy tài khoản")
    })
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth);
        return ResponseEntity.ok("Xóa tài khoản thành công");
    }
}
