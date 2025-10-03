package com.tmdt.BEphonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về sau khi tạo PayPal order
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayPalOrderResponse {
    private String orderId; // ID của order PayPal
    private String status; // trạng thái order (vd: created, approved, failed)
    private String approvalUrl; // URL để user redirect tới approve thanh toán
}
