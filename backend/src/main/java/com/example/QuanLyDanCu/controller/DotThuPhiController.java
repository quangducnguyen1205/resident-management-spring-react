package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.request.DotThuPhiRequestDto;
import com.example.QuanLyDanCu.dto.request.DotThuPhiUpdateDto;
import com.example.QuanLyDanCu.dto.response.DotThuPhiResponseDto;
import com.example.QuanLyDanCu.service.DotThuPhiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
@RequestMapping("/api/dot-thu-phi")
@RequiredArgsConstructor
@Tag(name = "Đợt Thu Phí", description = "API quản lý đợt thu phí")
public class DotThuPhiController {

    private final DotThuPhiService service;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Lấy danh sách tất cả đợt thu phí", description = "Trả về danh sách tất cả các đợt thu phí trong hệ thống")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DotThuPhiResponseDto.class)))
    })
    public ResponseEntity<List<DotThuPhiResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Lấy đợt thu phí theo ID", description = "Trả về thông tin chi tiết của một đợt thu phí")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy đợt thu phí",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DotThuPhiResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy đợt thu phí", content = @Content)
    })
    public ResponseEntity<DotThuPhiResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN')")
    @Operation(summary = "Tạo đợt thu phí mới", description = "Tạo một đợt thu phí mới (yêu cầu quyền ADMIN hoặc KETOAN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo đợt thu phí thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DotThuPhiResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content)
    })
    public ResponseEntity<DotThuPhiResponseDto> create(@Valid @RequestBody DotThuPhiRequestDto dto, Authentication auth) {
        DotThuPhiResponseDto created = service.create(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN')")
    @Operation(summary = "Cập nhật đợt thu phí (partial update)", description = "Cập nhật thông tin đợt thu phí - chỉ cập nhật các trường được cung cấp (yêu cầu quyền ADMIN hoặc KETOAN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DotThuPhiResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy đợt thu phí", content = @Content)
    })
    public ResponseEntity<DotThuPhiResponseDto> update(@PathVariable Long id, @RequestBody DotThuPhiUpdateDto dto, Authentication auth) {
        return ResponseEntity.ok(service.update(id, dto, auth));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN')")
    @Operation(summary = "Xóa đợt thu phí", description = "Xóa một đợt thu phí (yêu cầu quyền ADMIN hoặc KETOAN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa thành công", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy đợt thu phí", content = @Content)
    })
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth);
        return ResponseEntity.ok("Đã xóa đợt thu phí id = " + id);
    }
}
