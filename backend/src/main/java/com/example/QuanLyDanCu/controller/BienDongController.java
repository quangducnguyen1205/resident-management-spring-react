package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.response.BienDongResponseDto;
import com.example.QuanLyDanCu.service.BienDongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bien-dong")
@RequiredArgsConstructor
@Tag(name = "Biến Động", description = "API chỉ đọc để xem nhật ký biến động")
public class BienDongController {

    private final BienDongService bienDongService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG','KETOAN')")
    @Operation(summary = "Lấy danh sách biến động dạng log thuần văn bản")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<BienDongResponseDto>> getAll() {
        return ResponseEntity.ok(bienDongService.getAllDto());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','TOTRUONG','KETOAN')")
    @Operation(summary = "Lấy chi tiết biến động theo ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy biến động"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy biến động")
    })
    public ResponseEntity<BienDongResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bienDongService.getByIdDto(id));
    }

}
