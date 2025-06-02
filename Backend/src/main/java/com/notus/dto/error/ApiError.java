package com.notus.dto.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private HttpStatus status;
    private String message;
    private String debugMessage;
    private Map<String, List<String>> fieldErrors;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    public static ApiError of(HttpStatus status, String message, Throwable ex) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .debugMessage(ex.getLocalizedMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ApiError of(HttpStatus status, String message, Map<String, List<String>> fieldErrors) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .fieldErrors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .build();
    }
} 