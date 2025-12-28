package com.example.QuanLyDanCu.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Standard JSON structure for error responses returned by the API.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private final int status;
    private final String message;
    private final OffsetDateTime timestamp;
    private final Map<String, ?> errors;

    private ApiErrorResponse(Builder builder) {
        this.status = builder.status;
        this.message = builder.message;
        this.timestamp = builder.timestamp;
        this.errors = builder.errors;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private int status;
        private String message;
        private OffsetDateTime timestamp;
        private Map<String, ?> errors;

        private Builder() {
        }

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder timestamp(OffsetDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder errors(Map<String, ?> errors) {
            this.errors = errors;
            return this;
        }

        public ApiErrorResponse build() {
            if (timestamp == null) {
                timestamp = OffsetDateTime.now();
            }
            return new ApiErrorResponse(this);
        }
    }
}
