package com.tmdt.BEphonestore.dto.response;

import com.tmdt.BEphonestore.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private Long id;
    private Long orderId;
    private OrderStatus status;
    private String description;
    private String location;
    private String updatedBy;
    private LocalDateTime createdAt;
}
