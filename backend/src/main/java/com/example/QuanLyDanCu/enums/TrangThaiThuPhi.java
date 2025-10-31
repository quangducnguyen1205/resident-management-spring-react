package com.example.QuanLyDanCu.enums;

/**
 * Enum định nghĩa trạng thái thu phí hộ khẩu
 */
public enum TrangThaiThuPhi {
    CHUA_NOP,        // Chưa nộp (hoặc nộp chưa đủ) - For mandatory fees
    DA_NOP,          // Đã nộp đủ - For mandatory fees  
    KHONG_AP_DUNG;   // Không áp dụng - For voluntary fees (no fixed amount required)

    /**
     * Kiểm tra xem giá trị có hợp lệ không
     */
    public static boolean isValid(String value) {
        if (value == null) return false;
        try {
            TrangThaiThuPhi.valueOf(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Lấy mô tả tiếng Việt
     */
    public String getVietnameseDescription() {
        switch (this) {
            case CHUA_NOP:
                return "Chưa nộp đủ";
            case DA_NOP:
                return "Đã nộp đủ";
            case KHONG_AP_DUNG:
                return "Không áp dụng (Phí tự nguyện)";
            default:
                return this.name();
        }
    }
}
