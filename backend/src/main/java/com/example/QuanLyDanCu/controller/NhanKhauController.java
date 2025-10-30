package com.example.QuanLyDanCu.controller;

import com.example.QuanLyDanCu.dto.request.NhanKhauRequestDto;
import com.example.QuanLyDanCu.dto.response.NhanKhauResponseDto;
import com.example.QuanLyDanCu.entity.NhanKhau;
import com.example.QuanLyDanCu.service.NhanKhauService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/nhan-khau")
@RequiredArgsConstructor
@Tag(name = "Nhân Khẩu", description = "API quản lý nhân khẩu (citizen management)")
public class NhanKhauController {

    private final NhanKhauService nhanKhauService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả nhân khẩu", description = "Trả về danh sách đầy đủ thông tin nhân khẩu")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    public ResponseEntity<List<NhanKhauResponseDto>> getAll() {
        return ResponseEntity.ok(nhanKhauService.getAllDto());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin nhân khẩu theo ID", description = "Trả về thông tin chi tiết của một nhân khẩu")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
        @ApiResponse(responseCode = "400", description = "Không tìm thấy nhân khẩu với ID đã cho")
    })
    public ResponseEntity<NhanKhauResponseDto> getById(
            @Parameter(description = "ID của nhân khẩu", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(nhanKhauService.getByIdDto(id));
    }

    @PostMapping
    @Operation(summary = "Tạo mới nhân khẩu", description = "Thêm một nhân khẩu mới vào hệ thống")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Tạo nhân khẩu thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @ApiResponse(responseCode = "403", description = "Không có quyền thực hiện thao tác")
    })
    public ResponseEntity<NhanKhauResponseDto> create(
            @Valid @RequestBody NhanKhauRequestDto dto,
            Authentication auth) {
        NhanKhauResponseDto created = nhanKhauService.createDto(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin nhân khẩu", description = "Cập nhật thông tin của nhân khẩu theo ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc không tìm thấy nhân khẩu"),
        @ApiResponse(responseCode = "403", description = "Không có quyền thực hiện thao tác")
    })
    public ResponseEntity<NhanKhauResponseDto> update(
            @Parameter(description = "ID của nhân khẩu", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody NhanKhauRequestDto dto,
            Authentication auth) {
        return ResponseEntity.ok(nhanKhauService.updateDto(id, dto, auth));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa nhân khẩu", description = "Xóa nhân khẩu khỏi hệ thống")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Xóa thành công"),
        @ApiResponse(responseCode = "400", description = "Không tìm thấy nhân khẩu"),
        @ApiResponse(responseCode = "403", description = "Không có quyền thực hiện thao tác")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID của nhân khẩu", example = "1")
            @PathVariable Long id,
            Authentication auth) {
        nhanKhauService.delete(id, auth);
        return ResponseEntity.noContent().build();
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
    @Operation(summary = "Tìm kiếm nhân khẩu theo tên", description = "Tìm kiếm nhân khẩu có tên chứa từ khóa")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tìm kiếm thành công")
    })
    public ResponseEntity<List<NhanKhau>> searchByName(
            @Parameter(description = "Từ khóa tìm kiếm", example = "Nguyen")
            @RequestParam("q") String q) {
        return ResponseEntity.ok(nhanKhauService.searchByName(q));
    }

    // Thống kê giới tính
    @GetMapping("/stats/gender")
    @Operation(summary = "Thống kê theo giới tính", description = "Thống kê số lượng nhân khẩu theo giới tính")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Thống kê thành công")
    })
    public ResponseEntity<Map<String, Object>> statsGender() {
        return ResponseEntity.ok(nhanKhauService.statsGender());
    }

    // Thống kê theo tuổi (thiếu nhi/đi làm/về hưu)
    @GetMapping("/stats/age")
    @Operation(summary = "Thống kê theo độ tuổi", description = "Thống kê nhân khẩu theo nhóm tuổi: thiếu nhi, người đi làm, người về hưu")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Thống kê thành công")
    })
    public ResponseEntity<Map<String, Object>> statsByAge(
            @Parameter(description = "Độ tuổi thiếu nhi (mặc định 16)", example = "18")
            @RequestParam(value = "underAge", required = false) Integer underAge,
            @Parameter(description = "Độ tuổi về hưu (mặc định 60)", example = "60")
            @RequestParam(value = "retireAge", required = false) Integer retireAge
    ) {
        return ResponseEntity.ok(nhanKhauService.statsByAge(underAge, retireAge));
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
