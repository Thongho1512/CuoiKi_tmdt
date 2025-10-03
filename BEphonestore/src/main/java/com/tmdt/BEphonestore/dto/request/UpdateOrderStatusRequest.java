package com.tmdt.BEphonestore.dto.request;

import com.tmdt.BEphonestore.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Update Order Status Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    private String description;

    private String location;
}
