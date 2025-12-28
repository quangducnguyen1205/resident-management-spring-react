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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thu-phi-ho-khau")
@RequiredArgsConstructor
@Tag(name = "Thu Phí Hộ Khẩu", description = "API quản lý thu phí hộ khẩu")
public class ThuPhiHoKhauController {

    private final ThuPhiHoKhauService thuPhiHoKhauService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Lấy danh sách tất cả thu phí", description = "Trả về danh sách tất cả các bản ghi thu phí hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getAll() {
        return ResponseEntity.ok(thuPhiHoKhauService.getAll());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Thống kê thu phí", description = "Thống kê tổng quan về thu phí hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy thống kê thành công")
    })
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(thuPhiHoKhauService.getStats());
    }

    @GetMapping("/calculate")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Tính phí cho hộ khẩu", description = "Tính tổng phí cho một hộ khẩu trong đợt thu phí cụ thể với tính toán số tháng động. Công thức: định_mức_tháng * số_tháng * số_người")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tính phí thành công"),
            @ApiResponse(responseCode = "400", description = "Không tìm thấy hộ khẩu hoặc đợt thu phí")
    })
    public ResponseEntity<Map<String, Object>> calculateFee(
            @Parameter(description = "ID hộ khẩu", example = "1", required = true)
            @RequestParam Long hoKhauId,
            @Parameter(description = "ID đợt thu phí", example = "1", required = true)
            @RequestParam Long dotThuPhiId) {
        return ResponseEntity.ok(thuPhiHoKhauService.calculateFee(hoKhauId, dotThuPhiId));
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Tổng quan thu phí theo đợt", description = "Trả về toàn bộ hộ khẩu cùng trạng thái thu phí cho một đợt cụ thể")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy tổng quan thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
        public ResponseEntity<Map<String, Object>> getOverviewByPeriod(
            @Parameter(description = "ID đợt thu phí", required = true)
            @RequestParam Long dotThuPhiId) {
        return ResponseEntity.ok(thuPhiHoKhauService.getOverviewByPeriod(dotThuPhiId));
    }

    @GetMapping("/ho-khau/{hoKhauId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Lấy danh sách thu phí theo hộ khẩu", description = "Trả về danh sách các bản ghi thu phí của một hộ khẩu")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getByHoKhauId(@PathVariable Long hoKhauId) {
        return ResponseEntity.ok(thuPhiHoKhauService.findByHoKhauId(hoKhauId));
    }

    @GetMapping("/dot-thu-phi/{dotThuPhiId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN','TOTRUONG')")
    @Operation(summary = "Lấy danh sách thu phí theo đợt thu", description = "Trả về danh sách các bản ghi thu phí của một đợt thu phí")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class)))
    })
    public ResponseEntity<List<ThuPhiHoKhauResponseDto>> getByDotThuPhiId(@PathVariable Long dotThuPhiId) {
        return ResponseEntity.ok(thuPhiHoKhauService.findByDotThuPhiId(dotThuPhiId));
    }


    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN')")
        @Operation(summary = "Tạo bản ghi thu phí mới", description = "Tạo một bản ghi thu phí hộ khẩu mới (yêu cầu quyền ADMIN hoặc KETOAN). Phí bắt buộc sẽ tự tính số người và tổng phí. Phí tự nguyện yêu cầu cung cấp trường tongPhi trong payload.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo thu phí thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ThuPhiHoKhauResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập (chỉ ADMIN hoặc KETOAN)", content = @Content)
    })
    public ResponseEntity<ThuPhiHoKhauResponseDto> create(@Valid @RequestBody ThuPhiHoKhauRequestDto dto, Authentication auth) {
        ThuPhiHoKhauResponseDto created = thuPhiHoKhauService.create(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','KETOAN')")
    @Operation(summary = "Xóa thu phí", description = "Xóa một bản ghi thu phí (yêu cầu quyền ADMIN hoặc KETOAN)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Xóa thành công", content = @Content),
            @ApiResponse(responseCode = "403", description = "Không có quyền truy cập (chỉ ADMIN hoặc KETOAN)", content = @Content),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy thu phí", content = @Content)
    })
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication auth) {
        thuPhiHoKhauService.delete(id, auth);
        return ResponseEntity.ok("Đã xóa thu phí id = " + id);
    }
}
