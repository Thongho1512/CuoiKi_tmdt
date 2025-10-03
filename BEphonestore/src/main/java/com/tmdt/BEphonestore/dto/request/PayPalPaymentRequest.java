package com.tmdt.BEphonestore.dto.request;

import lombok.*;

/**
 * PayPal Payment Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayPalPaymentRequest {

    private String paypalOrderId;

    private Long orderId;
}
