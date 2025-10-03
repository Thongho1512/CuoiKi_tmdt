package com.tmdt.BEphonestore.exception;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Error Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
}
