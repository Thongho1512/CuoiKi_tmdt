package com.tmdt.BEphonestore.exception;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Validation Error Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationErrorResponse {

    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> errors;
}