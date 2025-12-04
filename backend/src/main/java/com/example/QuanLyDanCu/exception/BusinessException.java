package com.example.QuanLyDanCu.exception;

/**
 * Thrown when a business rule is violated even though the request is syntactically valid.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
