package com.example.QuanLyDanCu.exception;

/**
 * Thrown when a requested resource cannot be found in the system.
 */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
