package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.request.BienDongRequestDto;
import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
import com.example.QuanLyDanCu.service.BienDongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bien-dong")
@RequiredArgsConstructor
@Tag(name = "Biến Động", description = "API quản lý biến động nhân khẩu")
public class BienDongController {

    private final BienDongService bienDongService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả biến động")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<BienDongResponseDto>> getAll() {
        return ResponseEntity.ok(bienDongService.getAllDto());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy biến động theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy biến động"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy biến động")
    })
    public ResponseEntity<BienDongResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bienDongService.getByIdDto(id));
    }

    @PostMapping
    @Operation(summary = "Tạo biến động mới")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền")
    })
    public ResponseEntity<BienDongResponseDto> create(
            @Valid @RequestBody BienDongRequestDto dto,
            Authentication auth) {
        BienDongResponseDto created = bienDongService.createDto(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật biến động")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "403", description = "Không có quyền"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy biến động")
    })
    public ResponseEntity<BienDongResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody BienDongRequestDto dto,
            Authentication auth) {
        BienDongResponseDto updated = bienDongService.updateDto(id, dto, auth);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa biến động")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy biến động")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        bienDongService.delete(id, auth);
    }
}
