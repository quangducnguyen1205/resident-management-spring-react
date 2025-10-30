package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.request.ThuPhiHoKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.ThuPhiHoKhauResponseDto;
import com.example.QuanLyDanCu.service.ThuPhiHoKhauService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
import java.util.Map;

@RestController
@RequestMapping("/api/thu-phi-ho-khau")
@RequiredArgsConstructor
@Tag(name = "Thu Phí Hộ Khẩu", description = "API quản lý thu phí hộ khẩu")
public class ThuPhiHoKhauController {

    private final ThuPhiHoKhauService service;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả thu phí", description = "Trả về danh sách tất cả các bản ghi thu phí hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê thu phí", description = "Thống kê tổng quan về thu phí hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thống kê thành công")
    })
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(service.getStats());
    }

    @GetMapping("/calc")
    @Operation(summary = "Tính phí cho hộ khẩu", description = "Tính tổng phí cho một hộ khẩu trong đợt thu phí cụ thể. Áp dụng giảm giá 20% nếu hộ có người cao tuổi (≥60) hoặc sinh viên (≤22)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tính phí thành công"),
            @ApiResponse(responseCode = "400", description = "Không tìm thấy hộ khẩu hoặc đợt thu phí")
    })
    public ResponseEntity<Map<String, Object>> calculateFee(
            @Parameter(description = "ID hộ khẩu", example = "1", required = true)
            @RequestParam Long hoKhauId,
            @Parameter(description = "ID đợt thu phí", example = "1", required = true)
            @RequestParam Long dotThuPhiId) {
        return ResponseEntity.ok(service.calculateTotalFee(hoKhauId, dotThuPhiId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thu phí theo ID", description = "Trả về thông tin chi tiết của một bản ghi thu phí")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy thu phí",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thu phí", content = @Content)
    })
    public ResponseEntity<ThuPhiHoKhauResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/ho-khau/{hoKhauId}")
    @Operation(summary = "Lấy danh sách thu phí theo hộ khẩu", description = "Trả về danh sách các bản ghi thu phí của một hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getByHoKhauId(@PathVariable Long hoKhauId) {
        return ResponseEntity.ok(service.findByHoKhauId(hoKhauId));
    }

    @GetMapping("/dot-thu-phi/{dotThuPhiId}")
    @Operation(summary = "Lấy danh sách thu phí theo đợt thu", description = "Trả về danh sách các bản ghi thu phí của một đợt thu phí")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getByDotThuPhiId(@PathVariable Long dotThuPhiId) {
        return ResponseEntity.ok(service.findByDotThuPhiId(dotThuPhiId));
    }

    @PostMapping
    @Operation(summary = "Tạo bản ghi thu phí mới", description = "Tạo một bản ghi thu phí hộ khẩu mới (yêu cầu quyền ADMIN hoặc TOTRUONG)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo thu phí thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content)
    })
    public ResponseEntity<ThuPhiHoKhauResponseDto> create(@Valid @RequestBody ThuPhiHoKhauRequestDto dto, Authentication auth) {
        ThuPhiHoKhauResponseDto created = service.create(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thu phí", description = "Cập nhật thông tin thu phí hộ khẩu (yêu cầu quyền ADMIN hoặc TOTRUONG)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thu phí", content = @Content)
    })
    public ResponseEntity<ThuPhiHoKhauResponseDto> update(@PathVariable Long id, @Valid @RequestBody ThuPhiHoKhauRequestDto dto, Authentication auth) {
        return ResponseEntity.ok(service.update(id, dto, auth));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thu phí", description = "Xóa một bản ghi thu phí (yêu cầu quyền ADMIN hoặc TOTRUONG)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa thành công", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập", content = @Content),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thu phí", content = @Content)
    })
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, auth);
        return ResponseEntity.ok("Đã xóa thu phí id = " + id);
    }
}
