package com.example.QuanLyDanCu.exception;

/**
 * Thrown when the client sends invalid or incomplete data.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
