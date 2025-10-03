package com.tmdt.BEphonestore.dto.request;

import com.tmdt.BEphonestore.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Order Tracking Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    @Size(max = 500)
    private String description;

    @Size(max = 200)
    private String location;
}
